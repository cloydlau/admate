import { isVue3, onMounted, reactive, ref, watch } from 'vue-demi'
import { conclude } from 'vue-global-config'
import { assignIn, at, cloneDeep, debounce, isPlainObject, merge, set } from 'lodash-es'
import createAPI from './api'

export function getValue(object, path) {
  if (object && path) {
    switch (typeof path) {
      case 'string':
        // paths 为 undefined 或 '' 时结果为 undefined
        return at(object, path)[0]
      case 'function':
        return path(object)
      case 'symbol':
        if (isPlainObject(object)) {
          return object[path]
        }
    }
  }
  return object
}

export function setValue(object, path, value) {
  if (object && path) {
    switch (typeof path) {
      case 'string':
        // paths 为 undefined 或 '' 时结果为 undefined
        // set 会改变原始对象
        return set(object, path, value)
      case 'function':
        return path(object)
      case 'symbol':
        if (isPlainObject(object)) {
          object[path] = value
        }
    }
  }
  return object
}

// 将接口返回值混入form.data
function mergeFormData(_form, newFormData) {
  if (_form.mergeData && isPlainObject(_form.data) && isPlainObject(newFormData)) {
    // if (isProxy(_form.data)) { // vue 2 中报错
    if (isVue3) {
      // merge, assignIn 会改变原始对象
      // merge, assignIn 会改变原始对象
      if (_form.mergeData === 'deep') {
        merge(_form.data, newFormData)
      }
      else if (_form.mergeData === 'shallow') {
        assignIn(_form.data, newFormData)
      }
      else if (typeof _form.mergeData === 'function') {
        _form.mergeData(newFormData)
      }
    }
    else {
      // merge, assignIn, Object.assign 对对象属性的修改在 vue 2中无法触发更新
      // https://cn.vuejs.org/v2/guide/reactivity.html#%E5%AF%B9%E4%BA%8E%E5%AF%B9%E8%B1%A1
      // 可选择直接赋值，或者 Vue.set
      if (_form.mergeData === 'deep') {
        _form.data = merge(cloneDeep(_form.data), newFormData)
      }
      else if (_form.mergeData === 'shallow') {
        _form.data = {
          ..._form.data,
          ...newFormData,
        }
      }
      else if (typeof _form.mergeData === 'function') {
        _form.mergeData(newFormData)
      }
    }
  }
  else {
    _form.data = newFormData
  }
}

export default function useAdmate({
  axios,
  axiosConfig,
  urlPrefix,
  list,
  form,
}) {
  const api = createAPI(axios, axiosConfig, urlPrefix)

  const readListTrigger = ref()

  const getInitialList = () =>
    conclude([list], {
      default: userProp => ({
        data: [],
        loading: false,
        total: 0,
        ...userProp?.pageNumberAt && {
          filter: setValue({}, userProp.pageNumberAt, 1),
        },
        watchFilter: true,
        debounceInterval: 300,
      }),
      defaultIsDynamic: true,
    })

  const _list = reactive(getInitialList())

  const getInitialForm = () =>
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

  const _form = reactive(getInitialForm())

  // 设置表单的终态
  const setTerminalState = ({
    // todo: vue 2 中传参后再修改会丢失响应性
    // target,
    state,
    defaultState,
    mergeState = 'shallow',
  }) => {
    const TERMINAL_STATE = conclude([state, defaultState])
    // merge, assignIn, Object.assign 对对象属性的修改在 vue 2中无法触发更新
    // 但是对于对象本身是可以生效的，且直接赋值反而无效
    if (mergeState === 'deep') {
      merge(_form, TERMINAL_STATE)
    }
    else {
      assignIn(_form, TERMINAL_STATE)
    }
  }

  const readList = (payload = _list.filter, payloadAs) => {
    _list.loading = true
    return api
      .getList(payload, payloadAs)
      .then((response) => {
        _list.data = getValue(response, _list.dataAt) ?? []
        _list.total = _list.data?.length ? getValue(response, _list.totalAt) ?? 0 : 0
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

  const _ReadListProxy = (...args) => {
    // console.log(`getListProxy 因 ${trigger} 被调用`)
    const newPageNumber = getValue(_list.filter, _list.pageNumberAt)
    if (readListTrigger.value === 'filterChange' && newPageNumber !== 1) {
      // 如果改变的不是页码 页码重置为1 并拦截本次请求
      setValue(_list.filter, _list.pageNumberAt, 1)
      readListTrigger.value = undefined
      return
    }

    oldPageNumber = newPageNumber

    // args 是用户直接调用 getList 传的参，优先级低
    // args_proxy 是用户在 getListProxy 内部调用 getList 传的参，优先级高
    const result = _list.proxy.read
      ? _list.proxy.read(
        (...args_proxy) => readList(...(args_proxy.length ? args_proxy : args)),
        readListTrigger.value,
      )
      : readList(...args)

    readListTrigger.value = undefined

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
  _form.delete = (payload, payloadAs) =>
    api.d(payload, payloadAs).then((response) => {
      if (_list.data?.length === 1) {
        const currPageNumber = getValue(_list.filter, _list.pageNumberAt)
        if (currPageNumber === 1) {
          readListTrigger.value = 'd'
          _ReadListProxy()
        }
        else {
          readListTrigger.value = 'd'
          setValue(_list.filter, _list.pageNumberAt, currPageNumber - 1)
          if (!_list.watchFilter) {
            _ReadListProxy()
          }
        }
      }
      else {
        readListTrigger.value = 'd'
        _ReadListProxy()
      }
      return response
    })

  // 改变单条记录状态
  _form.switch = (payload, payloadAs) =>
    api.updateStatus(payload, payloadAs).then((response) => {
      readListTrigger.value = 'updateStatus'
      _ReadListProxy()
      return response
    })

  // 启用单条记录
  _form.enable = (payload, payloadAs) =>
    api.enable(payload, payloadAs).then((response) => {
      readListTrigger.value = 'enable'
      _ReadListProxy()
      return response
    })

  // 停用单条记录
  _form.disable = (payload, payloadAs) =>
    api.disable(payload, payloadAs).then((response) => {
      readListTrigger.value = 'disable'
      _ReadListProxy()
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

  _form.open = (payload, payloadAs) => {
    // 查看和编辑时，回显单条记录数据
    if (payload) {
      if (payloadAs === 'cache') {
        mergeFormData(_form, cloneDeep(payload))
        _form.show = true
      }
      else {
        _form.loading = true
        _form.show = true
        return api.r(payload, payloadAs).then((response) => {
          mergeFormData(_form, getValue(response, _form.dataAt))
          return response
        })
      }
    }
    else {
      // 查看时参数必传，编辑时可以不传因为可能是覆盖式编辑
      if (_form.status === 'read' && !arguments.length) {
        console.warn('When the form status is \'read\', the parameter of `form.open` must be passed')
      }

      _form.show = true
    }
  }

  const _openFormProxy = (...args) => {
    const result = openFormProxy
      ? openFormProxy((...args_proxy) =>
        // args 是用户直接调用 openForm 传的参，优先级低
        // args_proxy 是用户在 openFormProxy 内部调用 openForm 传的参，优先级高
        openForm(...(args_proxy.length ? args_proxy : args)),
      )
      : openForm(...args)
    if (result instanceof Promise) {
      result
        .then((state) => {
          setTerminalState({
            target: _form,
            state,
            defaultState: {
              loading: false,
            },
          })
        })
        .catch((state) => {
          setTerminalState({
            target: _form,
            state,
            defaultState: {
              show: false,
            },
          })
        })
    }
    else {
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
  const submitForm = (payload = _form.data, payloadAs) => {
    if (!_form.status || !['c', 'u'].includes(_form.status)) {
      throw new Error('submitForm can only be called when the form status is \'c\' or \'u\'')
    }

    _form.submitting = true
    return api[_form.status](payload, payloadAs).then((response) => {
      readListTrigger.value = _form.status
      _ReadListProxy()
      return response
    })
  }

  const _submitFormProxy = (params) => {
    const result = submitFormProxy
      ? submitFormProxy((...args) =>
        // params 是用户直接调用 submitForm 传的参，优先级低
        // args 是用户在 submitFormProxy 内部调用 submitForm 传的参，优先级高
        args.length ? submitForm(...args) : submitForm(params),
      )
      : submitForm(params)
    if (result instanceof Promise) {
      result
        .then((state) => {
          setTerminalState({
            target: _form,
            state,
            defaultState: {
              show: false,
            },
          })
        })
        .catch((state) => {
          setTerminalState({
            target: _form,
            state,
            defaultState: {
              submitting: false,
            },
          })
        })
    }
    else {
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
    readListDebounced.value = null
    Object.assign(_list, getInitialList())
    Object.assign(_form, getInitialForm())
  } */

  // 首次获取列表
  readListTrigger.value = 'init'
  _ReadListProxy()

  onMounted(() => {
    // 筛选项改变时，刷新列表
    if (_list.watchFilter) {
      const readListDebounced = ref(
        debounce(() => {
          readListTrigger.value = 'filterChange'
          _ReadListProxy()
        }, _list.debounceInterval),
      )

      // 异步的目的：避免 onMounted 时给 list.filter 赋初值触发 watch，该 watch 应仅由用户操作触发
      setTimeout(() => {
        watch(
          () => _list.filter,
          () => {
            if (getValue(_list.filter, _list.pageNumberAt) === oldPageNumber) {
              readListDebounced.value()
            }
            else {
              // 翻页不需要防抖
              // ||= 的原因是删除当前分页最后一条记录时也会触发翻页
              readListTrigger.value ??= 'pageNumberChange'
              _ReadListProxy()
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

  return { list: _list, form: _form }
}
