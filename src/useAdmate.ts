import {
  isVue3,
  ref,
  reactive,
  watch,
  toRaw,
  onMounted,
  onUnmounted,
} from 'vue-demi'
import { isEmpty, notEmpty, getFinalProp } from 'kayran'
import { throttle, cloneDeep, isPlainObject, at } from 'lodash-es'
import { cancelAllRequest } from './api-generator'
import type { APIType } from './api-generator'

const CONSOLE_PREFIX = import.meta.env.VITE_APP_CONSOLE_PREFIX

type StatusType = '' | 'c' | 'r' | 'u'

const At = (response?: object, paths?: string | Function): any => {
  return typeof paths === 'function' ? paths(response) : at(response, paths)[0]
}

export default function useAdmate ({
  api,
  form,
  list,
  getListProxy,
}: {
  api: APIType,
  form?: {
    show?: boolean,
    data?: any,
    dataAt: string | Function,
    loading?: boolean,
    status?: StatusType,
  },
  list?: {
    filter?: object,
    pageNumberParam: string,
    watchFilter?: boolean,
    data?: any[],
    dataAt: string | Function,
    total?: number,
    totalAt: string | Function,
    loading?: boolean,
  },
  getListProxy?: (getList: Function, caller: string, response?: any) => any,
}): object {
  let listFilterForm = ref(null)
  let getListThrottled = ref(null)

  const getInitialList = () => getFinalProp([list], {
    default: userProp => ({
      data: [],
      loading: false,
      total: 0,
      filter: {
        [userProp.pageNumberParam]: 1,
      },
      watchFilter: true,
    }),
    defaultIsDynamic: true,
  })

  let List = reactive(getInitialList())

  const getInitialForm = () => ({
    loading: false,
    show: false,
    data: {},
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
      .finally(e => {
        List.loading = false
      })
    })
  }

  const GetListProxy = getListProxy ?
    ({
      caller = Form.status,
      response
    }: {
      caller?: string,
      response?: any
    }) => {
      getListProxy(getList, caller, response)
    } :
    getList

  // crud参数处理
  const crudArgsHandler = (payload = {}, payloadUse = 'data', caller, Form) => {
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

    Form.payload = payloadUse === 'cache' ? cloneDeep(payload) : payload
    Form.payloadUse = payloadUse

    if (isRorU) {
      Form.status = caller
      Form.show = true
    }
  }

  // 新增单条记录
  const c = () => {
    Form.status = 'c'
    Form.show = true
  }

  // 查看单条记录
  const r = (payload?, payloadUse?: string) => {
    crudArgsHandler(payload, payloadUse, 'r', Form)
  }

  // 编辑单条记录
  const u = (payload?, payloadUse?: string) => {
    crudArgsHandler(payload, payloadUse, 'u', Form)
  }

  // 删除单条记录
  const d = (payload?, payloadUse?: string) => {
    crudArgsHandler(payload, payloadUse, 'd', Form)
    List.loading = true
    api.d(payload, payloadUse,).then(async response => {
      if (List.data?.length === 1) {
        if (List.filter[List.pageNumberParam] === 1) {
          await GetListProxy({ response })
        } else {
          List.filter[List.pageNumberParam]--
        }
      } else {
        await GetListProxy({ response })
      }
    }).finally(e => {
      List.loading = false
    })
  }

  // 改变单条记录状态
  const updateStatus = (payload?, payloadUse?: string) => {
    crudArgsHandler(payload, payloadUse, 'updateStatus', Form)
    List.loading = true
    api.updateStatus(payload, payloadUse,).then(async response => {
      await GetListProxy({ response })
    }).finally(e => {
      List.loading = false
    })
  }

  // 启用单条记录
  const enable = (payload?, payloadUse?: string) => {
    crudArgsHandler(payload, payloadUse, 'enable', Form)
    List.loading = true
    api.enable(payload, payloadUse,).then(async response => {
      await GetListProxy({ response })
    }).finally(e => {
      List.loading = false
    })
  }

  // 停用单条记录
  const disable = (payload?, payloadUse?: string) => {
    crudArgsHandler(payload, payloadUse, 'disable', Form)
    List.loading = true
    api.disable(payload, payloadUse,).then(async response => {
      await GetListProxy({ response })
    }).finally(e => {
      List.loading = false
    })
  }

  // 表单回显
  const retrieve = () => {
    // 仅查看和编辑才调用
    if (!['r', 'u'].includes(Form.status)) {
      return
    }

    return new Promise((resolve, reject) => {
      const responseult = api.r(Form.payload, Form.payloadUse)

      if (Form.payloadUse === 'cache') {
        resolve(responseult)
        Form.data = {
          ...Form.data,
          ...responseult
        }
      } else {
        responseult.then(response => {
          const formData = At(response, Form.dataAt)
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

  // 表单提交
  const submit = async (paramsHandler?: any) => {
    let params = Form.data
    if (typeof paramsHandler === 'function') {
      await paramsHandler()
    } else if (paramsHandler !== undefined) {
      params = paramsHandler
    }
    return api[Form.status](params)
    .then(async response => {
      await GetListProxy({ response })
    })
  }

  // 表单关闭时，重置表单（Form.data交由KiFormDialog重置）
  watch('Form.show', n => {
    if (!n) {
      Form.status = ''
      Form.payload = {}
      Form.payloadUse = null
      Form.loading = false
    }
  })

  // 首次获取列表
  GetListProxy({ caller: 'init' })

  onMounted(() => {
    // 给各筛选项赋初值，使得重置功能能够正常工作
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

    // 筛选项改变时，刷新列表
    if (List.watchFilter) {
      watch('List.filter', newFilter => {
        if (!getListThrottled) {
          getListThrottled = throttle(() => {
            const callback = async valid => {
              if (valid) {
                // 如果改变的不是页码 页码重置为1
                if (List.prevPageNo === newFilter[List.pageNumberParam]) {
                  List.filter[List.pageNumberParam] === 1 ?
                    await GetListProxy({ caller: 'filterChange' }) :
                    List.filter[List.pageNumberParam] = 1
                } else {
                  // 刷新列表
                  await GetListProxy({ caller: 'pageNumberChange' })
                }
                List.prevPageNo = newFilter[List.pageNumberParam]
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
    // 重置所有数据
    listFilterForm.value = null
    getListThrottled.value = null
    Object.assign(List, getInitialList())
    Object.assign(Form, getInitialForm())
  })

  return {
    listFilterForm,
    list: List,
    form: Form,
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
