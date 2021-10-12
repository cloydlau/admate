import { ref, reactive, watch, onMounted, } from 'vue-demi'
import { isEmpty, notEmpty, getFinalProp } from 'kayran'
import { throttle, cloneDeep, isPlainObject, at, merge, assignIn } from 'lodash-es'
import createAPIGenerator from './api-generator'
import type { ConfigCatalogType } from './api-generator'

const CONSOLE_PREFIX = import.meta.env.VITE_APP_CONSOLE_PREFIX

type StatusType = '' | 'c' | 'r' | 'u'
type MergeDataType = 'deep' | 'shallow' | false
type RRowType = 'data' | 'params' | 'config' | 'cache'
type CUDRowType = 'data' | 'params' | 'config'
type SubmitTerminalState = { show?: boolean, submitting?: boolean } | void
type SubmitType = (params: any) => Promise<any>

const At = (response?: object, paths?: string | Function): any => {
  return typeof paths === 'function' ? paths(response) : at(response, paths)[0]
}

// 将接口返回值混入row.data
const mergeRowData = (
  Row: {
    data: any,
    mergeData: MergeDataType,
  },
  newRowData,
) => {
  if (Row.mergeData) {
    // merge, assignIn会改变原始对象
    Row.mergeData === 'deep' ?
      merge(Row.data, newRowData) :
      assignIn(Row.data, newRowData)
  } else {
    Row.data = newRowData
  }
}

export default function useAdmate ({
  axios,
  axiosConfig,
  urlPrefix,
  row,
  list,
  getListProxy,
  submitProxy,
}: {
  axios,
  axiosConfig: ConfigCatalogType,
  urlPrefix?: string,
  row?: {
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
    getList: (payload?: object, payloadUse?: string) => Promise<any> | void,
    caller?: string
  ) => any,
  submitProxy?: (submit: SubmitType) => SubmitTerminalState | Promise<SubmitTerminalState>,
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
  const getInitialRow = () => cloneDeep({
    loading: false,
    submitting: false,
    show: false,
    data: {},
    mergeData: 'shallow',
    payload: {},
    payloadUse: null,
    status: '',
    resolve: null,
    reject: null,
    ...row,
  })

  const Row = reactive(getInitialRow())

  const getList = (
    payload = List.filter,
    payloadUse?: string
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
      api.getList(payload, payloadUse)
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

  // crud参数处理
  const crudArgsHandler = (payload = {}, payloadUse = 'data', caller) => {
    const isRorU = ['r', 'u'].includes(caller)
    switch (payloadUse) {
      case 'data':
        break
      case 'params':
        break
      case 'config':
        break
      case 'cache':
        if (!isRorU) {
          throw Error(`${CONSOLE_PREFIX}只有r和u的参数2可以使用\'cache\'`)
        }
        if (notEmpty(payload) && !isPlainObject(payload)) {
          throw Error(`${CONSOLE_PREFIX}直接使用列表数据时，参数1的类型需为object`)
        }
        break
      default:
        throw Error(`${CONSOLE_PREFIX}${caller}的参数2需为\'params\'/\'data\'/\'config\'${isRorU ? `\'/cache\'` : ''}`)
    }

    Row.payload = payloadUse === 'cache' ? cloneDeep(payload) : payload
    Row.payloadUse = payloadUse

    if (isRorU) {
      Row.status = caller
      Row.show = true
    }
  }

  // 新增单条记录
  const c = () => {
    Row.status = 'c'
    Row.show = true
  }

  // 查看单条记录
  const r = (payload?, payloadUse?: RRowType) => {
    crudArgsHandler(payload, payloadUse, 'r')
    return new Promise((resolve, reject) => {
      Row.resolve = resolve
      Row.reject = reject
    })
  }

  // 编辑单条记录
  const u = (payload?, payloadUse?: RRowType) => {
    crudArgsHandler(payload, payloadUse, 'u')
    return new Promise((resolve, reject) => {
      Row.resolve = resolve
      Row.reject = reject
    })
  }

  // 删除单条记录
  const d = (payload?, payloadUse?: CUDRowType) => {
    crudArgsHandler(payload, payloadUse, 'd')
    List.loading = true
    return api.d(payload, payloadUse,).then(response => {
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
  const updateStatus = (payload?, payloadUse?: CUDRowType) => {
    crudArgsHandler(payload, payloadUse, 'updateStatus')
    List.loading = true
    return api.updateStatus(payload, payloadUse,).then(response => {
      GetListProxy('updateStatus')
      return response
    }).finally(() => {
      List.loading = false
    })
  }

  // 启用单条记录
  const enable = (payload?, payloadUse?: CUDRowType) => {
    crudArgsHandler(payload, payloadUse, 'enable')
    List.loading = true
    return api.enable(payload, payloadUse,).then(response => {
      GetListProxy('enable')
      return response
    }).finally(() => {
      List.loading = false
    })
  }

  // 停用单条记录
  const disable = (payload?, payloadUse?: CUDRowType) => {
    crudArgsHandler(payload, payloadUse, 'disable')
    List.loading = true
    return api.disable(payload, payloadUse,).then(response => {
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

  // 表单提交
  const submit: SubmitType = (params = Row.data) => {
    Row.submitting = true
    return api[Row.status](params)
    .then(response => {
      GetListProxy(Row.status)
      return response
    })
  }
  const controlRowDialog = (
    options: { show?: boolean, submitting?: boolean },
    defaultOptions,
  ) => {
    const { show, submitting } = getFinalProp([options, defaultOptions])
    if (typeof show === 'boolean') {
      Row.show = show
    }
    if (typeof submitting === 'boolean') {
      Row.submitting = submitting
    }
  }
  const SubmitProxy = (params: any = Row.data) => {
    const result = submitProxy ?
      submitProxy(submit) :
      submit(params)
    if (result instanceof Promise) {
      result.then(e => {
        controlRowDialog(e, {
          show: false
        })
      }).catch(e => {
        controlRowDialog(e, {
          submitting: false
        })
      })
    } else {
      controlRowDialog(result, {
        show: false
      })
    }
  }

  watch(() => Row.show, n => {
    if (n) {
      // 查看和编辑时，回显单条记录数据
      if (['r', 'u'].includes(Row.status)) {
        Row.loading = true
        if (Row.payloadUse === 'cache') {
          mergeRowData(Row, Row.payload)
          Row.resolve(Row.payload)
          Row.resolve = null
          Row.reject = null
          Row.loading = false
        } else {
          api.r(Row.payload, Row.payloadUse).then(response => {
            mergeRowData(Row, At(response, Row.dataAt))
            Row.resolve(response)
          }).catch(e => {
            Row.show = false // todo: 是否需要动态配置
            Row.reject(e)
          }).finally(() => {
            Row.resolve = null
            Row.reject = null
            Row.loading = false
          })
        }
      }
    } else {
      // 表单关闭时 重置表单
      // 可能会有关闭动画 所以加延迟
      setTimeout(() => {
        Object.assign(Row, getInitialRow())
      }, 150)
    }
  })

  // 重置所有数据
  /*const destroy = () => {
    getListThrottled.value = null
    Object.assign(List, getInitialList())
    Object.assign(Row, getInitialRow())
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
    row: Row,
    submit: SubmitProxy,
    getList: GetListProxy,
    c,
    r,
    u,
    d,
    updateStatus,
    enable,
    disable,
  }
}
