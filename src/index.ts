import { isVue3, onMounted, reactive, ref, watch } from 'vue-demi'
import { conclude } from 'vue-global-config'
import { assignIn, at, cloneDeep, debounce, isPlainObject, merge } from 'lodash-es'
import type { AxiosInstance } from 'axios'
import createAPIGenerator from './api-generator'
import type { Actions, PayloadAs } from './api-generator'

type _GetList = (payload: any, payloadAs?: PayloadAs) => Promise<any>
type _OpenForm = (payload: any, payloadAs?: PayloadAs | 'cache') => Promise<any> | undefined
type _SubmitForm = (params: any) => Promise<any>
type MergeState = 'deep' | 'shallow'

export type FormStatus = '' | 'c' | 'r' | 'u' | string
export type MergeFormData = 'deep' | 'shallow' | false | ((newFormData: any) => any)
export type GetListTrigger = 'init' | 'pageNumberChange' | 'filterChange' | 'c' | 'r' | 'u' | 'd' | 'updateStatus' | 'enable' | 'disable'
export interface Form {
  status?: FormStatus
  show?: boolean
  // closeDelay?: number | null,
  // closed?: boolean,
  data?: any
  dataAt?: string | ((...args: any) => unknown)
  mergeData?: MergeFormData
  loading?: boolean
  submitting?: boolean
}
export interface List {
  filter: Record<keyof any, any>
  pageNumberKey: string
  watchFilter?: boolean
  debounceInterval?: number
  data?: any[]
  dataAt?: string | ((...args: any) => unknown)
  total?: number
  totalAt?: string | ((...args: any) => unknown)
  loading?: boolean
}
export type GetList = (...args: any) => Promise<unknown> | void
export type OpenForm = (...args: any) => Form | Promise<any> | undefined
export type SubmitForm = (...args: any) => Form | Promise<any> | undefined
export type D = (payload: any, payloadAs: PayloadAs) => Promise<unknown>
export type Enable = (payload: any, payloadAs: PayloadAs) => Promise<unknown>
export type Disable = (payload: any, payloadAs: PayloadAs) => Promise<unknown>
export type UpdateStatus = (payload: any, payloadAs: PayloadAs) => Promise<unknown>

export function unwrap<V = any>(value: V, path?: string | ((value: V) => any) | symbol): any {
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
function mergeFormData(_form: Form,
  newFormData?: any) {
  if (_form.mergeData && isPlainObject(_form.data) && isPlainObject(newFormData)) {
    // if (isProxy(_form.data)) { // vue 2中报错
    if (isVue3) {
      // merge, assignIn 会改变原始对象
      // merge, assignIn 会改变原始对象
      if (_form.mergeData === 'deep') {
        merge(_form.data, newFormData)
      } else if (_form.mergeData === 'shallow') {
        assignIn(_form.data, newFormData)
      } else if (typeof _form.mergeData === 'function') {
        _form.mergeData(newFormData)
      }
    } else {
      // merge, assignIn, Object.assign 对对象属性的修改在 vue 2中无法触发更新
      // https://cn.vuejs.org/v2/guide/reactivity.html#%E5%AF%B9%E4%BA%8E%E5%AF%B9%E8%B1%A1
      // 可选择直接赋值，或者 Vue.set
      if (_form.mergeData === 'deep') {
        _form.data = merge(cloneDeep(_form.data), newFormData)
      } else if (_form.mergeData === 'shallow') {
        _form.data = {
          ..._form.data,
          ...newFormData,
        }
      } else if (typeof _form.mergeData === 'function') {
        _form.mergeData(newFormData)
      }
    }
  } else {
    _form.data = newFormData
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
  axios: AxiosInstance
  axiosConfig: Record<Actions, object | ((objForConfig: object) => object)>
  urlPrefix: string
  form?: Form
  list?: List
  getListProxy?: (getList: _GetList, trigger?: GetListTrigger) => void
  openFormProxy?: (openForm: _OpenForm) => Promise<Form> | Form | undefined
  submitFormProxy?: (submitForm: _SubmitForm) => Promise<Form> | Form | undefined
}): {
    list: List
    getList: GetList
    form: Form
    openForm: OpenForm
    submitForm: SubmitForm
    d: D
    enable: Enable
    disable: Disable
    updateStatus: UpdateStatus
  } {
  const apiGenerator = createAPIGenerator(axios)
  const api = apiGenerator(urlPrefix, axiosConfig)

  const getListTrigger = ref()

  const getInitialList = (): List =>
    conclude([list], {
      default: (userProp: List) => ({
        data: [],
        loading: false,
        total: 0,
        ...userProp?.pageNumberKey && {
          filter: {
            [userProp.pageNumberKey]: 1,
          },
        },
        watchFilter: true,
        debounceInterval: 300,
      }),
      defaultIsDynamic: true,
    })

  const _list: List = reactive(getInitialList())

  // TODO: 为什么需要深拷贝？
  const getInitialForm = (): Form =>
    cloneDeep({
      status: '',
      show: false,
      // closeDelay: 500,
      // closed: true,
      data: {},
      mergeData: 'deep',
      loading: false,
      submitting: false,
      ...form,
    })

  const _form: Form = reactive(getInitialForm())

  // 设置表单的终态
  const setTerminalState = ({
    // todo: vue 2中传参后再修改会丢失响应性
    // target,
    state,
    defaultState,
    mergeState = 'shallow',
  }: {
    target: Form | List
    state?: Form | List
    defaultState?: Form | List
    mergeState?: MergeState
  }) => {
    const TERMINAL_STATE = conclude([state, defaultState])
    // merge, assignIn, Object.assign 对对象属性的修改在 vue 2中无法触发更新
    // 但是对于对象本身是可以生效的，且直接赋值反而无效
    mergeState === 'deep' ? merge(_form, TERMINAL_STATE) : assignIn(_form, TERMINAL_STATE)
  }

  const getList = (payload = _list.filter, payloadAs: PayloadAs): Promise<unknown> => {
    _list.loading = true
    return api
      .getList(payload, payloadAs)
      .then((response: unknown) => {
        _list.data = unwrap(response, _list.dataAt) ?? []
        _list.total = _list.data?.length ? unwrap(response, _list.totalAt) ?? 0 : 0
        return response
      })
      .catch(() => {
        // _list.data.length = 0 // _list.data 可能为空
        _list.data = []
      })
      .finally(() => {
        _list.loading = false
      })
  }

  let oldPageNumber = 1

  const _getListProxy = (...args: any) => {
    // console.log(`getListProxy 因 ${trigger} 被调用`)
    const newPageNumber = _list.filter[_list.pageNumberKey]
    if (getListTrigger.value === 'filterChange' && newPageNumber !== 1) {
      // 如果改变的不是页码 页码重置为1 并拦截本次请求
      _list.filter[_list.pageNumberKey] = 1
      getListTrigger.value = undefined
      return
    }

    oldPageNumber = newPageNumber

    // args 是用户直接调用 getList 传的参，优先级低
    // args_proxy 是用户在 getListProxy 内部调用 getList 传的参，优先级高
    const result = getListProxy
      ? getListProxy(
        (...args_proxy) => getList(...(args_proxy.length ? args_proxy : args) as [any, PayloadAs]),
        getListTrigger.value,
      )
      : getList(...args as [any, PayloadAs])

    getListTrigger.value = undefined

    return result

    /* if (result instanceof Promise) {
      // 不能统一写在finally中，因为：
      // 在then中能拿到用户resolve或者在then中return的参数
      // 在catch中能拿到用户reject或者在catch中return的参数
      // 在finally中拿不到参数
      result.then((state?: List) => {
        setTerminalState({
          target: _list,
          state,
          defaultState: {
            loading: false
          }
        })
      }).catch((state?: List) => {
        setTerminalState({
          target: _list,
          state,
          defaultState: {
            loading: false
          }
        })
      })
    } else {
      setTerminalState({
        target: _list,
        state: result,
        defaultState: {
          loading: false
        }
      })
    } */
  }

  // 删除单条记录
  const d = (payload: any, payloadAs: PayloadAs) =>
    api.d(payload, payloadAs).then((response) => {
      if (_list.data?.length === 1) {
        if (_list.filter[_list.pageNumberKey] === 1) {
          getListTrigger.value = 'd'
          _getListProxy()
        } else {
          _list.filter[_list.pageNumberKey]--
        }
      } else {
        getListTrigger.value = 'd'
        _getListProxy()
      }
      return response
    })

  // 改变单条记录状态
  const updateStatus = (payload: any, payloadAs: PayloadAs) =>
    api.updateStatus(payload, payloadAs).then((response) => {
      getListTrigger.value = 'updateStatus'
      _getListProxy()
      return response
    })

  // 启用单条记录
  const enable = (payload: any, payloadAs: PayloadAs) =>
    api.enable(payload, payloadAs).then((response) => {
      getListTrigger.value = 'enable'
      _getListProxy()
      return response
    })

  // 停用单条记录
  const disable = (payload: any, payloadAs: PayloadAs) =>
    api.disable(payload, payloadAs).then((response) => {
      getListTrigger.value = 'disable'
      _getListProxy()
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

  const openForm: _OpenForm = (payload: any, payloadAs?: PayloadAs | 'cache') => {
    // 查看和编辑时，回显单条记录数据
    if (payload) {
      if (payloadAs === 'cache') {
        mergeFormData(_form, cloneDeep(payload))
        _form.show = true
      } else {
        _form.loading = true
        _form.show = true
        return api.r(payload, payloadAs).then((response: unknown) => {
          mergeFormData(_form, unwrap(response, _form.dataAt))
          return response
        })
      }
    } else {
      // 查看时参数必传，编辑时可以不传因为可能是覆盖式编辑
      if (_form.status === 'r' && !arguments.length) {
        console.warn('表单状态为 \'r\' 时，openForm 的参数必传')
      }

      _form.show = true
    }
  }

  const _openFormProxy = (...args: any) => {
    const result = openFormProxy
      ? openFormProxy((...args_proxy) =>
        // args 是用户直接调用 openForm 传的参，优先级低
        // args_proxy 是用户在 openFormProxy 内部调用 openForm 传的参，优先级高
        openForm(...(args_proxy.length ? args_proxy : args) as [any, PayloadAs | 'cache']),
      )
      : openForm(...args as [any, PayloadAs | 'cache'])
    if (result instanceof Promise) {
      result
        .then((state?: Form) => {
          setTerminalState({
            target: _form,
            state,
            defaultState: {
              loading: false,
            },
          })
        })
        .catch((state?: Form) => {
          setTerminalState({
            target: _form,
            state,
            defaultState: {
              show: false,
            },
          })
        })
    } else {
      setTerminalState({
        target: _form,
        state: result,
        defaultState: {
          loading: false,
        },
      })
    }
    return result
  }

  // 表单提交
  const submitForm: _SubmitForm = (payload = _form.data, payloadAs?: PayloadAs) => {
    if (!_form.status || !['c', 'u'].includes(_form.status)) {
      throw new Error('submitForm can only be called when the form status is \'c\' or \'u\'')
    }

    _form.submitting = true
    return api[_form.status](payload, payloadAs).then((response) => {
      getListTrigger.value = _form.status
      _getListProxy()
      return response
    })
  }

  const _submitFormProxy = (params: any) => {
    const result = submitFormProxy
      ? submitFormProxy((...args) =>
        // params 是用户直接调用 submitForm 传的参，优先级低
        // args 是用户在 submitFormProxy 内部调用 submitForm 传的参，优先级高
        args.length ? submitForm(...args) : submitForm(params),
      )
      : submitForm(params)
    if (result instanceof Promise) {
      result
        .then((state?: Form) => {
          setTerminalState({
            target: _form,
            state,
            defaultState: {
              show: false,
            },
          })
        })
        .catch((state?: Form) => {
          setTerminalState({
            target: _form,
            state,
            defaultState: {
              submitting: false,
            },
          })
        })
    } else {
      setTerminalState({
        target: _form,
        state: result,
        defaultState: {
          show: false,
        },
      })
    }
    return result
  }

  watch(
    () => _form.show,
    (newShow) => {
      if (!newShow) {
        // 表单关闭时，重置表单
        // 可能会有关闭动画，所以加延迟
        setTimeout(() => {
          Object.assign(_form, {
            ...getInitialForm(),
            // 不能重置被监听的 show
            // 因为重置是异步的，如果在此 500ms 期间 show 被外部赋为 true，将导致死循环
            show: _form.show,
          })
        }, 500)
      }
    },
  )

  // 重置所有数据
  /* const destroy = () => {
    getListDebounced.value = null
    Object.assign(_list, getInitialList())
    Object.assign(_form, getInitialForm())
  } */

  // 首次获取列表
  getListTrigger.value = 'init'
  _getListProxy()

  onMounted(() => {
    // 筛选项改变时，刷新列表
    if (_list.watchFilter) {
      const getListDebounced = ref(
        debounce(() => {
          getListTrigger.value = 'filterChange'
          _getListProxy()
        }, _list.debounceInterval),
      )

      // 异步的目的：避免 onMounted 时给 list.filter 赋初值触发 watch，该 watch 应仅由用户操作触发
      setTimeout(() => {
        watch(
          () => _list.filter,
          () => {
            if (_list.filter[_list.pageNumberKey] === oldPageNumber) {
              getListDebounced.value()
            } else {
              // 翻页不需要防抖
              getListTrigger.value = 'pageNumberChange'
              _getListProxy()
            }
          },
          {
            deep: true,
          },
        )
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
    list: _list,
    getList: _getListProxy,
    form: _form,
    openForm: _openFormProxy,
    submitForm: _submitFormProxy,
    d,
    enable,
    disable,
    updateStatus,
  }
}
