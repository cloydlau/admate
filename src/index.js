import { assignIn, at, cloneDeep, debounce, isPlainObject, merge, set } from 'lodash-es'
import { isVue3, onMounted, reactive, ref, watch } from 'vue-demi'
import { conclude } from 'vue-global-config'
import createAPI from './api'

function getValue(object, path) {
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

function setValue(object, path, value) {
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
function mergeFormData(formExported, newFormData) {
  if (formExported.mergeData && isPlainObject(formExported.data) && isPlainObject(newFormData)) {
    // if (isProxy(formExported.data)) { // vue 2 中报错
    if (isVue3) {
      // merge, assignIn 会改变原始对象
      // merge, assignIn 会改变原始对象
      if (formExported.mergeData === 'deep') {
        merge(formExported.data, newFormData)
      }
      else if (formExported.mergeData === 'shallow') {
        assignIn(formExported.data, newFormData)
      }
      else if (typeof formExported.mergeData === 'function') {
        formExported.mergeData(newFormData)
      }
    }
    else {
      // merge, assignIn, Object.assign 对对象属性的修改在 vue 2中无法触发更新
      // https://cn.vuejs.org/v2/guide/reactivity.html#%E5%AF%B9%E4%BA%8E%E5%AF%B9%E8%B1%A1
      // 可选择直接赋值，或者 Vue.set
      if (formExported.mergeData === 'deep') {
        formExported.data = merge(cloneDeep(formExported.data), newFormData)
      }
      else if (formExported.mergeData === 'shallow') {
        formExported.data = {
          ...formExported.data,
          ...newFormData,
        }
      }
      else if (typeof formExported.mergeData === 'function') {
        formExported.mergeData(newFormData)
      }
    }
  }
  else {
    formExported.data = newFormData
  }
}

export default function useAdmate({
  axios,
  axiosConfig,
  list,
  form,
}) {
  const api = createAPI(axios, axiosConfig)

  const readListTrigger = ref()

  const getInitialList = () =>
    conclude([list], {
      default: userProp => ({
        data: [],
        loading: false,
        total: 0,
        filter: setValue({}, userProp?.pageNumberAt, 1),
        watchFilter: true,
        debounceInterval: 300,
        proxy: {},
      }),
      defaultIsDynamic: true,
    })

  const initialList = getInitialList()
  const initialListFilter = cloneDeep(initialList.filter)
  const listExported = reactive(initialList)

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
      title: '',
      proxy: {},
      ...form,
    })

  const formExported = reactive(getInitialForm())

  // 设置表单的终态
  const setTerminalFormState = ({
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
      merge(formExported, TERMINAL_STATE)
    }
    else {
      assignIn(formExported, TERMINAL_STATE)
    }
  }

  const readList = (payload = listExported.filter, payloadAs) => {
    listExported.loading = true
    return api.list.read(payload, payloadAs)
      .then((response) => {
        listExported.data = getValue(response, listExported.dataAt) ?? []
        listExported.total = listExported.data?.length ? getValue(response, listExported.totalAt) ?? 0 : 0
        return response
      })
      .catch(() => {
        // listExported.data.length = 0 // listExported.data 可能为空
        listExported.data = []
      })
      .finally(() => {
        listExported.loading = false
      })
  }

  const resetList = (payload, payloadAs) => {
    listExported.filter = cloneDeep(initialListFilter)
    if (!listExported.watchFilter) {
      readList(payload = listExported.filter, payloadAs)
    }
  }

  let oldPageNumber = 1

  listExported.read = (...args) => {
    const newPageNumber = getValue(listExported.filter, listExported.pageNumberAt)
    if (readListTrigger.value === 'filterChange' && newPageNumber !== 1) {
      // 如果改变的不是页码，页码重置为1，并拦截本次请求
      setValue(listExported.filter, listExported.pageNumberAt, 1)
      readListTrigger.value = undefined
      return
    }

    oldPageNumber = newPageNumber

    // args 是用户直接调用 list.read 传的参，优先级低
    // argsProxy 是用户在 list.proxy.read 内部调用 readList 传的参，优先级高
    const result = listExported.proxy.read
      ? listExported.proxy.read(
        (...argsProxy) => readList(...(argsProxy.length ? argsProxy : args)),
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
        setTerminalFormState({
          target: listExported,
          state,
          defaultState: {
            loading: false
          }
        })
      }).catch((state?: List) => {
        setTerminalFormState({
          target: listExported,
          state,
          defaultState: {
            loading: false
          }
        })
      })
    } else {
      setTerminalFormState({
        target: listExported,
        state: result,
        defaultState: {
          loading: false
        }
      })
    } */
  }

  // 列表重置
  listExported.reset = (...args) => {
    // args 是用户直接调用 list.reset 传的参，优先级低
    // argsProxy 是用户在 list.proxy.reset 内部调用 resetList 传的参，优先级高
    const result = listExported.proxy.reset
      ? listExported.proxy.reset(
        (...argsProxy) => resetList(...(argsProxy.length ? argsProxy : args)),
      )
      : resetList(...args)

    readListTrigger.value = undefined

    return result
  }

  // 列表筛选，页码重置
  listExported.search = (...args) => {
    if (getValue(listExported.filter, listExported.pageNumberAt) === 1) {
      listExported.read(...args)
    }
    else {
      setValue(listExported.filter, listExported.pageNumberAt, 1)
      if (!listExported.watchFilter) {
        listExported.read(...args)
      }
    }
  }

  // 删除单条记录
  formExported.delete = (payload, payloadAs) =>
    api.form.delete(payload, payloadAs).then((response) => {
      if (listExported.data?.length === 1) {
        const currPageNumber = getValue(listExported.filter, listExported.pageNumberAt)
        if (currPageNumber === 1) {
          readListTrigger.value = 'delete'
          listExported.read()
        }
        else {
          readListTrigger.value = 'delete'
          setValue(listExported.filter, listExported.pageNumberAt, currPageNumber - 1)
          if (!listExported.watchFilter) {
            listExported.read()
          }
        }
      }
      else {
        readListTrigger.value = 'delete'
        listExported.read()
      }
      return response
    })

  // 改变单条记录状态
  formExported.switch = (payload, payloadAs) =>
    api.form.switch(payload, payloadAs).then((response) => {
      readListTrigger.value = 'switch'
      listExported.read()
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

  const openForm = (payload, payloadAs) => {
    // 查看和编辑时，回显单条记录数据
    if (payload) {
      if (payloadAs === 'cache') {
        mergeFormData(formExported, cloneDeep(payload))
        formExported.show = true
      }
      else {
        formExported.loading = true
        formExported.show = true
        return api.form.read(payload, payloadAs).then((response) => {
          mergeFormData(formExported, getValue(response, formExported.dataAt))
          return response
        })
      }
    }
    else {
      // 查看时参数必传，编辑时可以不传因为可能是覆盖式编辑
      if (formExported.status === 'read' && !arguments.length) {
        console.warn('When the form status is \'read\', the parameter of `form.open` must be passed')
      }

      formExported.show = true
    }
  }

  formExported.open = (...args) => {
    const result = form.proxy.open
      ? form.proxy.open((...argsProxy) =>
        // args 是用户直接调用 form.open 传的参，优先级低
        // argsProxy 是用户在 form.proxy.open 内部调用 openForm 传的参，优先级高
        openForm(...(argsProxy.length ? argsProxy : args)),
      )
      : openForm(...args)
    if (result instanceof Promise) {
      result
        .then((state) => {
          setTerminalFormState({
            target: formExported,
            state,
            defaultState: {
              loading: false,
            },
          })
        })
        .catch((state) => {
          setTerminalFormState({
            target: formExported,
            state,
            defaultState: {
              show: false,
            },
          })
        })
    }
    else {
      setTerminalFormState({
        target: formExported,
        state: result,
        defaultState: {
          loading: false,
        },
      })
    }
    return result
  }

  formExported.create = (...args) => {
    formExported.status = 'create'
    formExported.open(...args)
  }

  formExported.read = (...args) => {
    formExported.status = 'read'
    formExported.open(...args)
  }

  formExported.update = (...args) => {
    formExported.status = 'update'
    formExported.open(...args)
  }

  // 表单提交
  const submitForm = (payload = formExported.data, payloadAs) => {
    if (!formExported.status || !['create', 'update'].includes(formExported.status)) {
      throw new Error('submitForm can only be called when the form status is \'create\' or \'update\'')
    }

    formExported.submitting = true
    return api.form[formExported.status](payload, payloadAs).then((response) => {
      readListTrigger.value = formExported.status
      listExported.read()
      return response
    })
  }

  formExported.submit = (...args) => {
    const result = form.proxy.submit
      ? form.proxy.submit((...argsProxy) =>
        // params 是用户直接调用 form.submit 传的参，优先级低
        // args 是用户在 form.proxy.submit 内部调用 submitForm 传的参，优先级高
        submitForm(...(argsProxy.length ? argsProxy : args)),
      )
      : submitForm(...args)
    if (result instanceof Promise) {
      result
        .then((state) => {
          setTerminalFormState({
            target: formExported,
            state,
            defaultState: {
              show: false,
            },
          })
        })
        .catch((state) => {
          setTerminalFormState({
            target: formExported,
            state,
            defaultState: {
              submitting: false,
            },
          })
        })
    }
    else {
      setTerminalFormState({
        target: formExported,
        state: result,
        defaultState: {
          show: false,
        },
      })
    }
    return result
  }

  watch(
    () => formExported.show,
    (newShow) => {
      if (!newShow) {
        // 表单关闭时，重置表单
        // 可能会有关闭动画，所以加延迟
        setTimeout(() => {
          Object.assign(formExported, {
            ...getInitialForm(),
            // 不能重置被监听的 show
            // 因为重置是异步的，如果在此 500ms 期间 show 被外部赋为 true，将导致死循环
            show: formExported.show,
          })
        }, 500)
      }
    },
  )

  // 重置所有数据
  /* const destroy = () => {
    readListDebounced.value = null
    Object.assign(listExported, getInitialList())
    Object.assign(formExported, getInitialForm())
  } */

  // 首次获取列表
  readListTrigger.value = 'immediate'
  listExported.read()

  onMounted(() => {
    // 筛选项改变时，刷新列表
    if (listExported.watchFilter) {
      const readListDebounced = ref(
        debounce(() => {
          readListTrigger.value = 'filterChange'
          listExported.read()
        }, listExported.debounceInterval),
      )

      // 异步的目的：避免 onMounted 时给 list.filter 赋初值触发 watch，该 watch 应仅由用户操作触发
      setTimeout(() => {
        watch(
          () => listExported.filter,
          () => {
            if (getValue(listExported.filter, listExported.pageNumberAt) === oldPageNumber) {
              readListDebounced.value()
            }
            else {
              // 翻页不需要防抖
              // ||= 的原因是删除当前分页最后一条记录时也会触发翻页
              readListTrigger.value ??= 'pageNumberChange'
              listExported.read()
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

  return { list: listExported, form: formExported }
}
