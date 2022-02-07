import { ref, reactive, watch, onMounted, isVue3 } from 'vue-demi'
import { isEmpty, getFinalProp } from 'kayran'
import { throttle, cloneDeep, at, merge, assignIn, isPlainObject } from 'lodash-es'
import createAPIGenerator from './api-generator'
import type { ConfigCatalogType } from './api-generator'

import { name } from '../package.json'
const CONSOLE_PREFIX = `${name} `

type StatusType = '' | 'c' | 'r' | 'u'
type MergeDataType = 'deep' | 'shallow' | false | ((newFormData: any) => any)
type MergeStateType = 'deep' | 'shallow'
type RFormType = 'data' | 'params' | 'config' | 'cache'
type CUDFormType = 'data' | 'params' | 'config'
type GetListType = (payload?: any, payloadAs?: string) => Promise<any>
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
  return isEmpty(paths) ? response :
    typeof paths === 'function' ? paths(response) :
      // paths为undefined或''时结果为undefined
      at(response, paths)[0]
}

// 将接口返回值混入form.data
const mergeFormData = (
  // 对象的对象属性作为参数传递时，属于值传递而不是引用传递
  // 对form这个响应式对象本身进行修改，才会被vue2检测到
  Form: FormType,
  newFormData?: any,
) => {
  if (
    Form.mergeData &&
    isPlainObject(Form.data) &&
    isPlainObject(newFormData)
  ) {
    //if (isProxy(Form.data)) { // vue2中报错
    if (isVue3) {
      // merge, assignIn会改变原始对象
      // merge, assignIn会改变原始对象
      if (Form.mergeData === 'deep') {
        merge(Form.data, newFormData)
      } else if (Form.mergeData === 'shallow') {
        assignIn(Form.data, newFormData)
      } else if (typeof Form.mergeData === 'function') {
        Form.mergeData(newFormData)
      }
    } else {
      // merge, assignIn, Object.assign对对象属性的修改在vue2中无法触发更新
      // https://cn.vuejs.org/v2/guide/reactivity.html#%E5%AF%B9%E4%BA%8E%E5%AF%B9%E8%B1%A1
      // 可选择直接赋值，或者Vue.set
      if (Form.mergeData === 'deep') {
        Form.data = merge(cloneDeep(Form.data), newFormData)
      } else if (Form.mergeData === 'shallow') {
        Form.data = {
          ...Form.data,
          ...newFormData,
        }
      } else if (typeof Form.mergeData === 'function') {
        Form.mergeData(newFormData)
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
    getList: GetListType,
    trigger?: string
  ) => void,
  openFormProxy?: (openForm: Function) => Promise<FormType> | FormType | void,
  submitFormProxy?: (submitForm: SubmitFormType) => Promise<FormType> | FormType | void,
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
    mergeData: 'deep',
    status: '',
    ...form,
  })

  let Form = reactive(getInitialForm())

  // 设置表单的终态
  const setTerminalState = ({
    // todo: vue2中传参后再修改会丢失响应性
    //target,
    state,
    defaultState,
    mergeState = 'shallow',
  }: {
    target: FormType | ListType,
    state?: FormType | ListType,
    defaultState?: FormType | ListType,
    mergeState: MergeStateType,
  }) => {
    const TERMINAL_STATE = getFinalProp([state, defaultState])
    // merge, assignIn, Object.assign对对象属性的修改在vue2中无法触发更新
    // 但是对于对象本身是可以生效的，且直接赋值反而无效
    mergeState === 'deep' ?
      merge(Form, TERMINAL_STATE) :
      assignIn(Form, TERMINAL_STATE)
  }

  const getList = (
    payload = List.filter,
    payloadAs?: CUDFormType
  ): GetListType => {
    //console.log(`getList被调用`)

    List.loading = true
    return api.getList(payload, payloadAs)
    .then(response => {
      List.data = At(response, List.dataAt) ?? []
      List.total = isEmpty(List.data) ? 0 : At(response, List.totalAt) ?? 0
      return response
    }).catch(e => {
      //List.data.length = 0 // List.data可能为空
      List.data = []
    }).finally(() => {
      List.loading = false
    })
  }

  const GetListProxy = (...args) => {
    //console.log(`getListProxy因${trigger}被调用`)
    const newPageNumber = List.filter[List.pageNumberKey]
    if (
      getListTrigger.value === 'filterChange' &&
      newPageNumber !== 1
    ) {
      // 如果改变的不是页码 页码重置为1 并拦截本次请求
      List.filter[List.pageNumberKey] = 1
      getListTrigger.value = undefined
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

    getListTrigger.value = undefined

    return result

    /*if (result instanceof Promise) {
      // 不能统一写在finally中，因为：
      // 在then中能拿到用户resolve或者在then中return的参数
      // 在catch中能拿到用户reject或者在catch中return的参数
      // 在finally中拿不到参数
      result.then((state?: ListType) => {
        setTerminalState({
          target: List,
          state,
          defaultState: {
            loading: false
          }
        })
      }).catch((state?: ListType) => {
        setTerminalState({
          target: List,
          state,
          defaultState: {
            loading: false
          }
        })
      })
    } else {
      setTerminalState({
        target: List,
        state: result,
        defaultState: {
          loading: false
        }
      })
    }*/
  }

  function openForm (payload?, payloadAs?: RFormType) {
    // 查看和编辑时，回显单条记录数据
    if (payload) {
      if (payloadAs === 'cache') {
        mergeFormData(Form, cloneDeep(payload))
        Form.show = true
      } else {
        Form.loading = true
        Form.show = true
        return api.r(payload, payloadAs).then(response => {
          mergeFormData(Form, At(response, Form.dataAt))
          return response
        })
      }
    } else {
      if (['r', 'u'].includes(Form.status) && !arguments.length) {
        console.warn(`${CONSOLE_PREFIX}表单状态为 'r' 或 'u' 时，openForm 的参数必传`)
      }
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

  const OpenFormProxy = (...args) => {
    const result = openFormProxy ?
      openFormProxy((...args_proxy) =>
        // args是用户直接调用openForm传的参，优先级低
        // args_proxy是用户在openFormProxy内部调用openForm传的参，优先级高
        openForm(...args_proxy.length ? args_proxy : args)
      ) :
      openForm(...args)
    if (result instanceof Promise) {
      result.then((state?: FormType) => {
        setTerminalState({
          target: Form,
          state,
          defaultState: {
            loading: false
          }
        })
      }).catch((state?: FormType) => {
        setTerminalState({
          target: Form,
          state,
          defaultState: {
            show: false,
          }
        })
      })
    } else {
      setTerminalState({
        target: Form,
        state: result,
        defaultState: {
          loading: false
        }
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
      result.then((state?: FormType) => {
        setTerminalState({
          target: Form,
          state,
          defaultState: {
            show: false
          }
        })
      }).catch((state?: FormType) => {
        setTerminalState({
          target: Form,
          state,
          defaultState: {
            submitting: false
          }
        })
      })
    } else {
      setTerminalState({
        target: Form,
        state: result,
        defaultState: {
          show: false
        }
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
              List.loading = false
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
