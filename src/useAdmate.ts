import {
  isVue3,
  ref,
  reactive,
  watch,
  toRaw,
  onMounted,
  onUnmounted,
} from 'vue-demi'
import { isEmpty, notEmpty } from 'kayran'
import { throttle, cloneDeep, isPlainObject, at } from 'lodash-es'
import { cancelAllRequest } from './api-generator'
import type { apiType } from './api-generator'

const CONSOLE_PREFIX = import.meta.env.VITE_APP_CONSOLE_PREFIX

export default function useAdmate ({
  api,
  getListProxy,
  list,
  form,
}: {
  api: apiType,
  getListProxy?: Function,
  list?: {
    data?: any[],
    dataPath: string | Function,
    loading?: boolean,
    total?: number,
    totalPath: string | Function,
    filter?: object,
    watchFilter?: boolean,
    pageNoField?: string,
  },
  form?: {
    loading?: boolean,
    show?: boolean,
    data?: any,
    dataPath: string | Function,
    status?: '' | 'c' | 'r' | 'u',
  },
}): object {
  let listFilterForm = ref(null)
  let getListThrottled = ref(null)

  const getInitialList = () => ({
    data: [],
    dataPath: 'list',
    loading: false,
    total: 0,
    totalPath: 'total',
    filter: {
      //[props.pageNo]: 1,
    },
    watchFilter: true,
    pageNoField: 'pageNo',
    ...list,
  })

  let List = reactive(getInitialList())

  const getInitialForm = () => ({
    loading: false,
    show: false,
    data: {},
    dataPath: '',
    payload: {},
    payloadUse: null,
    status: '',
    ...form,
  })

  let Form = reactive(getInitialForm())

  const getList = (
    payload = List.filter,
    payloadUse?: string
  ) => {
    List.loading = true
    List.data.length = 0
    return new Promise((resolve, reject) => {
      api.list(payload, payloadUse)
      .then(res => {
        for (let v of at(res, List.dataPath)) {
          if (Array.isArray(v)) {
            List.data = v
            List.total = at(res, List.totalPath)[0]
            break
          }
        }
        if (isEmpty(List.data)) {
          List.total = 0
        }
        resolve(res)
      })
      .catch(res => {
        reject(res)
      })
      .finally(e => {
        List.loading = false
      })
    })
  }

  const GetListProxy = getListProxy ?? getList

  const c = () => {
    Form.status = 'c'
    Form.show = true
  }

  const crudArgsHandler = (payload = {}, payloadUse = 'data', motive, Form) => {
    const isRorU = ['r', 'u'].includes(motive)
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
        throw Error(`${CONSOLE_PREFIX}${motive}的参数2需为\'params\'/\'data\'/\'config\'${isRorU ? `\'/cache\'` : ''}`)
    }

    Form.payload = payloadUse === 'cache' ? cloneDeep(payload) : payload
    Form.payloadUse = payloadUse

    if (isRorU) {
      Form.status = motive
      Form.show = true
    }
  }

  const r = (payload?, payloadUse?: string) => {
    crudArgsHandler(payload, payloadUse, 'r', Form)
  }

  const u = (payload?, payloadUse?: string) => {
    crudArgsHandler(payload, payloadUse, 'u', Form)
  }

  const d = (payload?, payloadUse?: string) => {
    crudArgsHandler(payload, payloadUse, 'd', Form)
    List.loading = true
    api.d(payload, payloadUse,).then(async res => {
      if (List.data?.length === 1) {
        if (List.filter[props.pageNo] === 1) {
          await GetListProxy('d', res)
        } else {
          List.filter[props.pageNo]--
        }
      } else {
        await GetListProxy('d', res)
      }
    }).finally(e => {
      List.loading = false
    })
  }

  const updateStatus = (payload?, payloadUse?: string) => {
    crudArgsHandler(payload, payloadUse, 'updateStatus', Form)
    List.loading = true
    api.updateStatus(payload, payloadUse,).then(async res => {
      await GetListProxy('updateStatus', res)
    }).finally(e => {
      List.loading = false
    })
  }

  const enable = (payload?, payloadUse?: string) => {
    crudArgsHandler(payload, payloadUse, 'enable', Form)
    List.loading = true
    api.enable(payload, payloadUse,).then(async res => {
      await GetListProxy('enable', res)
    }).finally(e => {
      List.loading = false
    })
  }

  const disable = (payload?, payloadUse?: string) => {
    crudArgsHandler(payload, payloadUse, 'disable', Form)
    List.loading = true
    api.disable(payload, payloadUse,).then(async res => {
      await GetListProxy('disable', res)
    }).finally(e => {
      List.loading = false
    })
  }

  const retrieve = () => {
    // 仅查看和编辑才调用
    if (!['r', 'u'].includes(Form.status)) {
      return
    }

    return new Promise((resolve, reject) => {
      const result = api.r(Form.payload, Form.payloadUse)

      if (Form.payloadUse === 'cache') {
        resolve(result)
        Form.data = {
          ...Form.data,
          ...result
        }
      } else {
        result.then(res => {
          const formData = at(res, Form.dataPath)[0]
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
          resolve(formData)
          // 将接口返回值混入form.data
          Form.data = {
            ...Form.data,
            ...formData
          }
        })
        .catch(e => {
          reject(e)
        })
      }
    })
  }

  const submit = async (paramsHandler?) => {
    let params = Form.data
    if (typeof paramsHandler === 'function') {
      await paramsHandler()
    } else if (paramsHandler !== undefined) {
      params = paramsHandler
    }
    return api[Form.status](params).then(async res => {
      await GetListProxy(Form.status, res)
    })
  }

  watch('Form.show', n => {
    if (!n) {
      Form.status = ''
      Form.payload = {}
      Form.payloadUse = null
      Form.loading = false
    }
  })

  GetListProxy('init')

  onMounted(() => {
    // fix: 没有声明的筛选参数无法重置
    if (listFilterForm?.fields) {
      List.filter = {
        ...Object.fromEntries(
          Array.from(
            listFilterForm.fields,
            (v: any) => [v.labelFor, undefined]
          )
        ),
        ...List.filter,
      }
    }

    if (List.watchFilter) {
      watch('List.filter', newFilter => {
        if (!getListThrottled) {
          getListThrottled = throttle(() => {
            const callback = async valid => {
              if (valid) {
                const pageNoField = props.pageNo

                // 如果改变的不是页码 页码重置为1
                if (List.prevPageNo === newFilter[pageNoField]) {
                  List.filter[pageNoField] === 1 ?
                    await GetListProxy('filterChange') :
                    List.filter[pageNoField] = 1
                } else {
                  // 刷新列表
                  await GetListProxy('pageNoChange')
                }
                List.prevPageNo = newFilter[pageNoField]
              }
            }
            if (listFilterForm) {
              listFilterForm.validate(callback)
            } else {
              //console.warn(`${CONSOLE_PREFIX}未找到$refs.listFilterForm`)
              callback(true)
            }
          }, 500, {
            leading: false, // true会导致：如果调用≥2次 则至少触发2次 但此时可能只期望触发1次
            trailing: true
          })
        }

        getListThrottled()
      }, {
        deep: true
      })
    }
  })

  onUnmounted(() => {
    // 页面销毁时如果还有查询请求 中止掉
    cancelAllRequest()
    listFilterForm.value = null
    getListThrottled.value = null
    Object.assign(List, getInitialList())
    Object.assign(Form, getInitialForm())
  })

  return {
    listFilterForm,
    List,
    Form,
    getList,
    c,
    r,
    u,
    d,
    updateStatus,
    enable,
    disable,
    retrieve,
    submit,
  }
}
