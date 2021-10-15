import { ref, reactive, watch, onMounted, isVue3 } from 'vue-demi'
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
type FormType = {
  show?: boolean,
  data?: any,
  dataAt?: string | Function,
  mergeData?: MergeDataType,
  loading?: boolean,
  submitting?: boolean,
  status?: StatusType,
}
type ListType = {
  filter?: object,
  pageNumberKey?: string,
  watchFilter?: boolean,
  throttleInterval?: number,
  data?: any[],
  dataAt?: string | Function,
  total?: number,
  totalAt?: string | Function,
  loading?: boolean,
}

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
    //if (isProxy(Form.data)) { // vue2中报错
    if (isVue3) {
      // merge, assignIn会改变原始对象
      Form.mergeData === 'deep' ?
        merge(Form.data, newFormData) :
        assignIn(Form.data, newFormData)
    } else {
      // merge和assignIn会破坏vue2中对象的__ob__属性，导致丢失响应性
      Form.data = Form.mergeData === 'deep' ?
        merge(cloneDeep(Form.data), newFormData) :
        {
          ...Form.data,
          ...newFormData,
        }
    }
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
  form?: FormType,
  list?: ListType,
  getListProxy?: (
    getList: (payload?: object, payloadAs?: string) => Promise<any> | void,
    trigger?: string
  ) => any,
  openFormProxy?: (openForm: Function) => OpenFormTerminalState | Promise<OpenFormTerminalState>,
  submitFormProxy?: (submitForm: SubmitFormType) => SubmitFormTerminalState | Promise<SubmitFormTerminalState>,
}): object {
  const apiGenerator = createAPIGenerator(axios)
  const api = apiGenerator(urlPrefix, axiosConfig)

  const getListTrigger = ref()
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
    payloadAs?: CUDFormType
  ) => {
    //console.log(`getList被调用`)

    List.loading = true
    List.data.length = 0
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
    })
  }

  const GetListProxy = (...args) => {
    //console.log(`getListProxy因${trigger}被调用`)
    const newPageNumber = List.filter[List.pageNumberKey]
    const triggeredByFilterChange = getListTrigger.value === 'filterChange'
    getListTrigger.value = undefined
    if (triggeredByFilterChange && newPageNumber !== 1) {
      // 如果改变的不是页码 页码重置为1 并拦截本次请求
      List.filter[List.pageNumberKey] = 1
      return
    }

    List.oldPageNumber = newPageNumber

    // args是用户直接调用getList传的参，优先级低
    // args_proxy是用户在getListProxy内部调用getList传的参，优先级高
    const result = getListProxy ?
      getListProxy((...args_proxy) =>
          getList(...args_proxy.length ? args_proxy : args)
        , getListTrigger.value) :
      getList(...args)

    if (result instanceof Promise) {
      // 不能统一写在finally中，因为：
      // 在then中能拿到用户resolve的参数
      // 在catch中能拿到用户reject的参数
      // 在finally中拿不到参数
      result.then(state => {
        setTerminalState(List, state, {
          loading: false
        })
      }).catch(state => {
        setTerminalState(List, state, {
          loading: false
        })
      })
    } else {
      setTerminalState(List, result, {
        loading: false
      })
    }

    return result
  }

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
          getListTrigger.value = 'd'
          GetListProxy()
        } else {
          List.filter[List.pageNumberKey]--
        }
      } else {
        getListTrigger.value = 'd'
        GetListProxy()
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
      getListTrigger.value = 'updateStatus'
      GetListProxy()
      return response
    }).finally(() => {
      List.loading = false
    })
  }

  // 启用单条记录
  const enable = (payload?, payloadAs?: CUDFormType) => {
    List.loading = true
    return api.enable(payload, payloadAs,).then(response => {
      getListTrigger.value = 'enable'
      GetListProxy()
      return response
    }).finally(() => {
      List.loading = false
    })
  }

  // 停用单条记录
  const disable = (payload?, payloadAs?: CUDFormType) => {
    List.loading = true
    return api.disable(payload, payloadAs,).then(response => {
      getListTrigger.value = 'disable'
      GetListProxy()
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

  const setTerminalState = (
    target: object,
    state: FormType | ListType,
    defaultState,
  ) => {
    target = {
      ...target,
      ...getFinalProp([state, defaultState]),
    }
  }

  const OpenFormProxy = (...args) => {
    const result = openFormProxy ?
      openFormProxy((...args_proxy) =>
        // args是用户直接调用openForm传的参，优先级低
        // args_proxy是用户在openFormProxy内部调用openForm传的参，优先级高
        openForm(...args_proxy.length ? args_proxy : args)
      ) :
      openForm(...args)
    if (result instanceof Promise) {
      result.then(state => {
        setTerminalState(Form, state, {
          loading: false
        })
      }).catch(state => {
        setTerminalState(Form, state, {
          show: false,
        })
      })
    } else {
      setTerminalState(Form, result, {
        loading: false
      })
    }
    return result
  }

  // 表单提交
  const submitForm: SubmitFormType = (payload = Form.data, payloadAs?: CUDFormType) => {
    if (!['c', 'u'].includes(Form.status)) {
      throw Error(`${CONSOLE_PREFIX}submitForm 仅能在表单状态为 'c' 或 'u' 时被调用`)
    }
    Form.submitting = true
    return api[Form.status](payload, payloadAs)
    .then(response => {
      getListTrigger.value = Form.status
      GetListProxy()
      return response
    })
  }

  const SubmitFormProxy = (params: any) => {
    const result = submitFormProxy ?
      submitFormProxy((...args) =>
        // params是用户直接调用submitForm传的参，优先级低
        // args是用户在submitFormProxy内部调用submitForm传的参，优先级高
        args.length ? submitForm(...args) : submitForm(params)
      ) :
      submitForm(params)
    if (result instanceof Promise) {
      result.then(e => {
        setTerminalState(Form, e, {
          show: false
        })
      }).catch(e => {
        setTerminalState(Form, e, {
          submitting: false
        })
      })
    } else {
      setTerminalState(Form, result, {
        show: false
      })
    }
    return result
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
  getListTrigger.value = 'init'
  GetListProxy()

  onMounted(() => {
    // 筛选项改变时，刷新列表
    if (List.watchFilter) {
      watch(() => List.filter, () => {
        if (List.filter[List.pageNumberKey] === List.oldPageNumber) {
          List.loading = true
          if (!getListThrottled.value) {
            getListThrottled.value = throttle(() => {
              getListTrigger.value = 'filterChange'
              GetListProxy()
            }, List.throttleInterval, {
              leading: false,
              trailing: true
            })
          }

          getListThrottled.value()
        } else {
          // 翻页不需要节流
          getListTrigger.value = 'pageNumberChange'
          GetListProxy()
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
