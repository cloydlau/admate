import { ref, reactive, watch, onMounted, } from 'vue-demi'
import { isEmpty, getFinalProp } from 'kayran'
import { throttle, cloneDeep, at, merge, assignIn } from 'lodash-es'
import createAPIGenerator from './api-generator'
import type { ConfigCatalogType } from './api-generator'

const CONSOLE_PREFIX = import.meta.env.VITE_APP_CONSOLE_PREFIX

type StatusType = '' | 'c' | 'r' | 'u'
type MergeDataType = 'deep' | 'shallow' | false
type RFormType = 'data' | 'params' | 'config' | 'cache'
type CUDFormType = 'data' | 'params' | 'config'
type SubmitFormType = (params: any) => Promise<any>
type OpenFormTerminalState = { show?: boolean, loading?: boolean } | void
type SubmitFormTerminalState = { show?: boolean, submitting?: boolean } | void

const At = (response?: object, paths?: string | Function): any => {
  return typeof paths === 'function' ? paths(response) : at(response, paths)[0]
}

// 将接口返回值混入form.data
const mergeFormData = (
  Form: {
    data: any,
    mergeData: MergeDataType,
  },
  newFormData,
) => {
  if (Form.mergeData) {
    // merge, assignIn会改变原始对象
    Form.mergeData === 'deep' ?
      merge(Form.data, newFormData) :
      assignIn(Form.data, newFormData)
  } else {
    Form.data = newFormData
  }
}

export default function useAdmate ({
  axios,
  axiosConfig,
  urlPrefix,
  form,
  list,
  getListProxy,
  openFormProxy,
  submitFormProxy,
}: {
  axios,
  axiosConfig: ConfigCatalogType,
  urlPrefix?: string,
  form?: {
    show?: boolean,
    data?: any,
    dataAt?: string | Function,
    mergeData?: MergeDataType,
    loading?: boolean,
    submitting?: boolean,
    status?: StatusType,
  },
  list?: {
    filter?: object,
    pageNumberKey?: string,
    watchFilter?: boolean,
    throttleInterval?: number,
    data?: any[],
    dataAt?: string | Function,
    total?: number,
    totalAt?: string | Function,
    loading?: boolean,
  },
  getListProxy?: (
    getList: (payload?: object, payloadAs?: string) => Promise<any> | void,
    caller?: string
  ) => any,
  openFormProxy?: (openForm: Function) => OpenFormTerminalState | Promise<OpenFormTerminalState>,
  submitFormProxy?: (submitForm: SubmitFormType) => SubmitFormTerminalState | Promise<SubmitFormTerminalState>,
}): object {
  const apiGenerator = createAPIGenerator(axios)
  const api = apiGenerator(urlPrefix, axiosConfig)

  const getListCaller = ref('')
  const getListThrottled = ref(null)

  const getInitialList = () => getFinalProp([list], {
    default: userProp => ({
      data: [],
      loading: false,
      total: 0,
      filter: {
        [userProp.pageNumberKey]: 1,
      },
      watchFilter: true,
      throttleInterval: 500,
    }),
    defaultIsDynamic: true,
  })

  const List = reactive(getInitialList())

  // todo: 为什么需要深拷贝？
  const getInitialForm = () => cloneDeep({
    loading: false,
    submitting: false,
    show: false,
    data: {},
    mergeData: 'shallow',
    status: '',
    ...form,
  })

  const Form = reactive(getInitialForm())

  const getList = (
    payload = List.filter,
    payloadAs?: string
  ) => {
    //console.log(`getList被调用`)

    const newPageNumber = List.filter[List.pageNumberKey]
    if (
      getListCaller.value === 'filterChange' &&
      newPageNumber !== 1
    ) {
      // 如果改变的不是页码 页码重置为1 并拦截本次请求
      List.filter[List.pageNumberKey] = 1
      return
    }

    List.loading = true
    List.data.length = 0
    List.oldPageNumber = newPageNumber
    getListCaller.value = ''
    return new Promise((resolve, reject) => {
      api.getList(payload, payloadAs)
      .then(response => {
        List.data = At(response, List.dataAt)
        List.total = At(response, List.totalAt)
        if (isEmpty(List.data)) {
          List.total = 0
        }
        resolve(response)
      })
      .catch(response => {
        reject(response)
      })
      .finally(() => {
        List.loading = false
      })
    })
  }

  const GetListProxy = getListProxy ?
    async (caller?) => {
      //console.log(`getListProxy因${caller}被调用`)
      getListCaller.value = caller
      List.loading = false
      await getListProxy(getList, getListCaller.value)
    } :
    getList

  const openForm = (payload?, payloadAs?: RFormType) => {
    switch (Form.status) {
      // 查看和编辑时，回显单条记录数据
      case 'r':
      case 'u':
        if (payloadAs === 'cache') {
          mergeFormData(Form, cloneDeep(payload))
          Form.show = true
        } else {
          Form.loading = true
          Form.show = true
          return api.r(payload, payloadAs).then(response => {
            mergeFormData(Form, At(response, Form.dataAt))
          })
        }

        break
      // 新增单条记录
      case 'c':
        if (payloadAs === 'cache') {
          throw Error(`${CONSOLE_PREFIX}只有当表单状态为 'r' 或 'u' 时，参数2才可以使用 'cache'`)
        }

        Form.status = 'c'
      default:
        Form.show = true
    }
  }

  // 删除单条记录
  const d = (payload?, payloadAs?: CUDFormType) => {
    List.loading = true
    return api.d(payload, payloadAs,).then(response => {
      if (List.data?.length === 1) {
        if (List.filter[List.pageNumberKey] === 1) {
          GetListProxy('d')
        } else {
          List.filter[List.pageNumberKey]--
        }
      } else {
        GetListProxy('d')
      }
      return response
    }).finally(() => {
      List.loading = false
    })
  }

  // 改变单条记录状态
  const updateStatus = (payload?, payloadAs?: CUDFormType) => {
    List.loading = true
    return api.updateStatus(payload, payloadAs,).then(response => {
      GetListProxy('updateStatus')
      return response
    }).finally(() => {
      List.loading = false
    })
  }

  // 启用单条记录
  const enable = (payload?, payloadAs?: CUDFormType) => {
    List.loading = true
    return api.enable(payload, payloadAs,).then(response => {
      GetListProxy('enable')
      return response
    }).finally(() => {
      List.loading = false
    })
  }

  // 停用单条记录
  const disable = (payload?, payloadAs?: CUDFormType) => {
    List.loading = true
    return api.disable(payload, payloadAs,).then(response => {
      GetListProxy('disable')
      return response
    }).finally(() => {
      List.loading = false
    })
  }

  // 坑：
  /*
    let obj = { a: 1 }
    obj = {
      ...obj,
      ...(obj => { // 该方法中对obj的修改不会对上一行中的obj生效
        obj.x = 1
      })()
    }
  */

  const controlFormDialog = (
    options: OpenFormTerminalState | SubmitFormTerminalState,
    defaultOptions,
  ) => {
    const { show, submitting, loading } = getFinalProp([options, defaultOptions])
    if (typeof show === 'boolean') {
      Form.show = show
    }
    if (typeof submitting === 'boolean') {
      Form.submitting = submitting
    }
    if (typeof loading === 'boolean') {
      Form.loading = loading
    }
  }

  const OpenFormProxy = (...args) => {
    const result = openFormProxy ?
      openFormProxy((...args_proxy) =>
        openForm(...args_proxy.length ? args_proxy : args)
      ) :
      openForm(...args)
    if (result instanceof Promise) {
      result.then(e => {
        controlFormDialog(e, {
          loading: false
        })
      }).catch(e => {
        controlFormDialog(e, {
          show: false,
        })
      })
    } else {
      controlFormDialog(result, {
        loading: false
      })
    }
  }

  // 表单提交
  const submitForm: SubmitFormType = (params = Form.data) => {
    if (!['c', 'u'].includes(Form.status)) {
      throw Error(`${CONSOLE_PREFIX}submitForm 仅能在表单状态为 'c' 或 'u' 时被调用`)
    }
    Form.submitting = true
    return api[Form.status](params)
    .then(response => {
      GetListProxy(Form.status)
      return response
    })
  }

  const SubmitFormProxy = (params: any = Form.data) => {
    const result = submitFormProxy ?
      submitFormProxy((...args) =>
        args.length ? submitForm(...args) : submitForm(params)
      ) :
      submitForm(params)
    if (result instanceof Promise) {
      result.then(e => {
        controlFormDialog(e, {
          show: false
        })
      }).catch(e => {
        controlFormDialog(e, {
          submitting: false
        })
      })
    } else {
      controlFormDialog(result, {
        show: false
      })
    }
  }

  watch(() => Form.show, n => {
    if (!n) {
      // 表单关闭时 重置表单
      // 可能会有关闭动画 所以加延迟
      setTimeout(() => {
        Object.assign(Form, {
          ...getInitialForm(),
          // 不能重置被监听的show
          // 因为重置是异步的，如果在此150ms期间show被外部赋为true，将导致死循环
          show: Form.show,
        })
      }, 150)
    }
  })

  // 重置所有数据
  /*const destroy = () => {
    getListThrottled.value = null
    Object.assign(List, getInitialList())
    Object.assign(Form, getInitialForm())
  }*/

  // 首次获取列表
  GetListProxy('init')

  onMounted(() => {
    // 筛选项改变时，刷新列表
    if (List.watchFilter) {
      watch(() => List.filter, () => {
        if (List.filter[List.pageNumberKey] === List.oldPageNumber) {
          List.loading = true
          if (!getListThrottled.value) {
            getListThrottled.value = throttle(() => {
              GetListProxy('filterChange')
            }, List.throttleInterval, {
              leading: false,
              trailing: true
            })
          }

          getListThrottled.value()
        } else {
          // 翻页不需要节流
          GetListProxy('pageNumberChange')
        }
      }, {
        deep: true
      })
    }
  })

  /*onUnmounted(() => {
    /!**
     * 页面销毁时如果还有查询请求，中止掉
     * 不能在onUnmounted调用cancelAllRequest，
     * 因为下一个页面的setup会早于上一个页面的onUnmounted执行，
     * 导致中止掉下一个页面的请求
     *!/
    //cancelAllRequest()
    //destroy()
  })*/

  return {
    list: List,
    getList: GetListProxy,

    form: Form,
    openForm: OpenFormProxy,
    submitForm: SubmitFormProxy,
    d,
    enable,
    disable,
    updateStatus,
  }
}
