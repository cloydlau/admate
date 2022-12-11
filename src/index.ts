import {
  isVue3,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue-demi'
import { conclude } from 'vue-global-config'
import { assignIn, at, cloneDeep, debounce, isPlainObject, merge } from 'lodash-es'
import { name } from '../package.json'
import createAPIGenerator from './api-generator'
import type { ConfigCatalogType } from './api-generator'

const CONSOLE_PREFIX = `${name} `

type StatusType = '' | 'c' | 'r' | 'u' | string
type MergeDataType = 'deep' | 'shallow' | false | ((newFormData: any) => any)
type MergeStateType = 'deep' | 'shallow'
type RFormType = 'data' | 'params' | 'config' | 'cache'
type CUDFormType = 'data' | 'params' | 'config'
type GetListType = (payload?: any, payloadAs?: string) => Promise<any>
type SubmitFormType = (params: any) => Promise<any>
interface FormType {
  show?: boolean
  // closeDelay?: number | null,
  // closed?: boolean,
  data?: any
  dataAt?: string | Function
  mergeData?: MergeDataType
  loading?: boolean
  submitting?: boolean
  status?: StatusType
}
interface ListType {
  filter: object
  pageNumberKey: string
  watchFilter?: boolean
  debounceInterval?: number
  data?: any[]
  dataAt?: string | Function
  total?: number
  totalAt?: string | Function
  loading?: boolean
}

function At<V = any>(value: V, path?: string | ((value: V) => any) | symbol): any {
  if (!(value && path)) {
    return value
  }
  switch (typeof path) {
    case 'string':
      // paths 为 undefined 或 '' 时结果为 undefined
      return at(value, path)[0]
    case 'function':
      return path(value)
    case 'symbol':
      if (isPlainObject(value)) {
        return value[path as keyof typeof value]
      }
  }
}

// 将接口返回值混入form.data
const mergeFormData = (
  // 对象的对象属性作为参数传递时，属于值传递而不是引用传递
  // 对 form 这个响应式对象本身进行修改，才会被 vue 2检测到
  Form: FormType,
  newFormData?: any,
) => {
  if (
    Form.mergeData
    && isPlainObject(Form.data)
    && isPlainObject(newFormData)
  ) {
    // if (isProxy(Form.data)) { // vue 2中报错
    if (isVue3) {
      // merge, assignIn 会改变原始对象
      // merge, assignIn 会改变原始对象
      if (Form.mergeData === 'deep') {
        merge(Form.data, newFormData)
      } else if (Form.mergeData === 'shallow') {
        assignIn(Form.data, newFormData)
      } else if (typeof Form.mergeData === 'function') {
        Form.mergeData(newFormData)
      }
    } else {
      // merge, assignIn, Object.assign 对对象属性的修改在 vue 2中无法触发更新
      // https://cn.vuejs.org/v2/guide/reactivity.html#%E5%AF%B9%E4%BA%8E%E5%AF%B9%E8%B1%A1
      // 可选择直接赋值，或者 Vue.set
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

export default function useAdmate({
  axios,
  axiosConfig,
  urlPrefix,
  form,
  list,
  getListProxy,
  openFormProxy,
  submitFormProxy,
}: {
  axios
  axiosConfig: ConfigCatalogType
  urlPrefix: string
  form?: FormType
  list?: ListType
  getListProxy?: (
    getList: GetListType,
    trigger?: string
  ) => void
  openFormProxy?: (openForm: Function) => Promise<FormType> | FormType | undefined
  submitFormProxy?: (submitForm: SubmitFormType) => Promise<FormType> | FormType | undefined
}): object {
  const apiGenerator = createAPIGenerator(axios)
  const api = apiGenerator(urlPrefix, axiosConfig)

  const getListTrigger = ref()

  const getInitialList = (): ListType => conclude([list], {
    default: userProp => ({
      data: [],
      loading: false,
      total: 0,
      filter: {
        [userProp.pageNumberKey]: 1,
      },
      watchFilter: true,
      debounceInterval: 300,
    }),
    defaultIsDynamic: true,
  })

  const List = reactive(getInitialList())

  // todo: 为什么需要深拷贝？
  const getInitialForm = (): FormType => cloneDeep({
    loading: false,
    submitting: false,
    show: false,
    // closeDelay: 500,
    // closed: true,
    data: {},
    mergeData: 'deep',
    status: '',
    ...form,
  })

  const Form = reactive(getInitialForm())

  // 设置表单的终态
  const setTerminalState = ({
    // todo: vue 2中传参后再修改会丢失响应性
    // target,
    state,
    defaultState,
    mergeState = 'shallow',
  }: {
    target: FormType | ListType
    state?: FormType | ListType
    defaultState?: FormType | ListType
    mergeState: MergeStateType
  }) => {
    const TERMINAL_STATE = conclude([state, defaultState])
    // merge, assignIn, Object.assign 对对象属性的修改在 vue 2中无法触发更新
    // 但是对于对象本身是可以生效的，且直接赋值反而无效
    mergeState === 'deep'
      ? merge(Form, TERMINAL_STATE)
      : assignIn(Form, TERMINAL_STATE)
  }

  const getList = (
    payload = List.filter,
    payloadAs?: CUDFormType,
  ): GetListType => {
    List.loading = true
    return api.getList(payload, payloadAs)
      .then((response) => {
        List.data = At(response, List.dataAt) ?? []
        List.total = List.data?.length ? At(response, List.totalAt) ?? 0 : 0
        return response
      }).catch(() => {
        // List.data.length = 0 // List.data 可能为空
        List.data = []
      }).finally(() => {
        List.loading = false
      })
  }

  let oldPageNumber = 1

  const GetListProxy = (...args) => {
    // console.log(`getListProxy 因 ${trigger} 被调用`)
    const newPageNumber = List.filter[List.pageNumberKey]
    if (
      getListTrigger.value === 'filterChange'
      && newPageNumber !== 1
    ) {
      // 如果改变的不是页码 页码重置为1 并拦截本次请求
      List.filter[List.pageNumberKey] = 1
      getListTrigger.value = undefined
      return
    }

    oldPageNumber = newPageNumber

    // args 是用户直接调用 getList 传的参，优先级低
    // args_proxy 是用户在 getListProxy 内部调用 getList 传的参，优先级高
    const result = getListProxy
      ? getListProxy((...args_proxy) =>
        getList(...args_proxy.length ? args_proxy : args)
      , getListTrigger.value)
      : getList(...args)

    getListTrigger.value = undefined

    return result

    /* if (result instanceof Promise) {
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
    } */
  }

  function openForm(payload?, payloadAs?: RFormType) {
    // 查看和编辑时，回显单条记录数据
    if (payload) {
      if (payloadAs === 'cache') {
        mergeFormData(Form, cloneDeep(payload))
        Form.show = true
      } else {
        Form.loading = true
        Form.show = true
        return api.r(payload, payloadAs).then((response) => {
          mergeFormData(Form, At(response, Form.dataAt))
          return response
        })
      }
    } else {
      // 查看时参数必传，编辑时可以不传因为可能是覆盖式编辑
      if (Form.status === 'r' && !arguments.length) {
        console.warn(`${CONSOLE_PREFIX}表单状态为 'r' 时，openForm 的参数必传`)
      }

      Form.show = true
    }
  }

  // 删除单条记录
  const d = (payload?, payloadAs?: CUDFormType) =>
    api.d(payload, payloadAs).then((response) => {
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
    })

  // 改变单条记录状态
  const updateStatus = (payload?, payloadAs?: CUDFormType) =>
    api.updateStatus(payload, payloadAs).then((response) => {
      getListTrigger.value = 'updateStatus'
      GetListProxy()
      return response
    })

  // 启用单条记录
  const enable = (payload?, payloadAs?: CUDFormType) =>
    api.enable(payload, payloadAs).then((response) => {
      getListTrigger.value = 'enable'
      GetListProxy()
      return response
    })

  // 停用单条记录
  const disable = (payload?, payloadAs?: CUDFormType) =>
    api.disable(payload, payloadAs).then((response) => {
      getListTrigger.value = 'disable'
      GetListProxy()
      return response
    })

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
    const result = openFormProxy
      ? openFormProxy((...args_proxy) =>
        // args 是用户直接调用 openForm 传的参，优先级低
        // args_proxy 是用户在 openFormProxy 内部调用 openForm 传的参，优先级高
        openForm(...args_proxy.length ? args_proxy : args),
      )
      : openForm(...args)
    if (result instanceof Promise) {
      result.then((state?: FormType) => {
        setTerminalState({
          target: Form,
          state,
          defaultState: {
            loading: false,
          },
        })
      }).catch((state?: FormType) => {
        setTerminalState({
          target: Form,
          state,
          defaultState: {
            show: false,
          },
        })
      })
    } else {
      setTerminalState({
        target: Form,
        state: result,
        defaultState: {
          loading: false,
        },
      })
    }
    return result
  }

  // 表单提交
  const submitForm: SubmitFormType = (payload = Form.data, payloadAs?: CUDFormType) => {
    if (!Form.status || !['c', 'u'].includes(Form.status))
      throw new Error(`${CONSOLE_PREFIX}submitForm 仅能在表单状态为 'c' 或 'u' 时被调用`)

    Form.submitting = true
    return api[Form.status](payload, payloadAs)
      .then((response) => {
        getListTrigger.value = Form.status
        GetListProxy()
        return response
      })
  }

  const SubmitFormProxy = (params) => {
    const result = submitFormProxy
      ? submitFormProxy((...args) =>
        // params 是用户直接调用 submitForm 传的参，优先级低
        // args 是用户在 submitFormProxy 内部调用 submitForm 传的参，优先级高
        args.length ? submitForm(...args) : submitForm(params),
      )
      : submitForm(params)
    if (result instanceof Promise) {
      result.then((state?: FormType) => {
        setTerminalState({
          target: Form,
          state,
          defaultState: {
            show: false,
          },
        })
      }).catch((state?: FormType) => {
        setTerminalState({
          target: Form,
          state,
          defaultState: {
            submitting: false,
          },
        })
      })
    } else {
      setTerminalState({
        target: Form,
        state: result,
        defaultState: {
          show: false,
        },
      })
    }
    return result
  }

  watch(() => Form.show, (n) => {
    if (!n) {
      // 表单关闭时，重置表单
      // 可能会有关闭动画，所以加延迟
      setTimeout(() => {
        Object.assign(Form, {
          ...getInitialForm(),
          // 不能重置被监听的 show
          // 因为重置是异步的，如果在此150ms期间 show 被外部赋为 true，将导致死循环
          show: Form.show,
        })
      }, 500)
    }
  })

  // 重置所有数据
  /* const destroy = () => {
    getListDebounced.value = null
    Object.assign(List, getInitialList())
    Object.assign(Form, getInitialForm())
  } */

  // 首次获取列表
  getListTrigger.value = 'init'
  GetListProxy()

  onMounted(() => {
    // 筛选项改变时，刷新列表
    if (List.watchFilter) {
      const getListDebounced = ref(debounce(() => {
        getListTrigger.value = 'filterChange'
        GetListProxy()
      }, List.debounceInterval))

      // 异步的目的：避免 onMounted 时给 list.filter 赋初值触发 watch，该 watch 应仅由用户操作触发
      setTimeout(() => {
        watch(() => List.filter, () => {
          if (List.filter[List.pageNumberKey] === oldPageNumber) {
            getListDebounced.value()
          } else {
            // 翻页不需要防抖
            getListTrigger.value = 'pageNumberChange'
            GetListProxy()
          }
        }, {
          deep: true,
        })
      }, 0)
    }
  })

  /* onUnmounted(() => {
    /!**
     * 页面销毁时如果还有查询请求，中止掉
     * 不能在 onUnmounted 调用 cancelAllRequest，
     * 因为下一个页面的 setup 会早于上一个页面的 onUnmounted 执行，
     * 导致中止掉下一个页面的请求
     *!/
    //cancelAllRequest()
    //destroy()
  }) */

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
