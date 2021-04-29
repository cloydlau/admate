import { isEmpty, getPropByPath } from 'kayran'
import { throttle, cloneDeep, isPlainObject } from 'lodash-es'
import { name } from '../package.json'
const prefix = `[${name}] `

function getInitData () {
  return {
    $_admate_props: null,
    $_admate_list: {
      data: [],
      loading: false,
      total: 0,
      filter: {},
      prevPageNo: 1,
      cancelToken: null
    },
    $_admate_row: {
      loading: false,
      show: false,
      data: {},
      initData: {},
      obj: {},
      objIs: null,
      status: '',
      cancelToken: null
    },
  }
}

function argsHandler (obj, objIs, motive, $_admate_row) {
  const isRorU = ['r', 'u'].includes(motive)
  switch (objIs) {
    case 'param':
      if (!(isPlainObject(obj) || obj instanceof FormData)) {
        throw Error(`${prefix} $_admate_${motive}的第一个参数的类型需为 object|FormData`)
      }
      break
    case 'config':
      break
    case 'data':
      if (!isRorU) {
        throw Error(`${prefix}' $_admate_${motive}的第二个参数需为 'param' 'config' 之一`)
      }
      if (!(isPlainObject(obj))) {
        throw Error(`${prefix}'直接使用列表数据时 $_admate_${motive}的第一个参数的类型需为 object'`)
      }
      break
    default:
      throw Error(`${prefix}' $_admate_${motive}的第二个参数需为 'param' ${isRorU ? 'data ' : ''}'config' 之一`)
  }

  $_admate_row.obj = objIs === 'data' ? cloneDeep(obj) : obj
  $_admate_row.objIs = objIs

  if (isRorU) {
    $_admate_row.status = motive
    $_admate_row.show = true
  }
}

function getMixins ({
  props,
  getListProxy,
  CancelToken,
}: {
  props?: object
  getListProxy?: Function
  CancelToken?: any
}): object {
  props = {
    pageNo: 'pageNo',
    pageSize: 'pageSize',
    total: 'data.total',
    list: ['data', 'data.records', 'data.list'], // 不分页/分页两种情况 data.list为兼容性代码
    r: 'data',
    ...props
  }

  getListProxy = getListProxy || this.$_admate_getList

  return {
    data () {
      return cloneDeep(getInitData())
    },
    watch: {
      async '$_admate_row.show' (newVal) {
        if (!newVal) {
          // 如果弹框readonly状态在弹框关闭动画结束之前改变 将导致弹框的按钮显隐错乱
          setTimeout(() => {
            this.$_admate_row.status = ''
          }, 300)

          this.$_admate_row.data = cloneDeep(this.$_admate_row.initData)
          this.$refs.rowForm && this.$refs.rowForm.clearValidate()
          this.$_admate_row.loading = false
        }
      }
    },
    /*beforeCreate() {
          for (let k in initData) {
            this[k] = initData[k]
          }
    },*/
    created () {
      // 混入对象的钩子将在组件自身钩子之前调用

      if (!this.$_admate_api) {
        throw new Error(prefix + 'data中未找到$_admate_api')
      }

      /**
       * 初始化接口参数、返回值格式
       */
      this.$_admate_props = {
        ...props,
        ...this.$_admate_props
      }
      if (!(this.$_admate_props.list instanceof Array)) {
        this.$_admate_props.list = [this.$_admate_props.list]
      }

      this.$_admate_getListProxy = this.$_admate_getListProxy || getListProxy

      this.$_admate_list.filter = {
        [this.$_admate_props.pageNo]: 1,
        [this.$_admate_props.pageSize]: this.$_admate_list.filter[this.$_admate_props.pageSize] || 10,
        ...this.$_admate_list.filter
      }

      if (Object.getOwnPropertyNames(this.$_admate_row.data).length > 0) {
        this.$_admate_row.initData = cloneDeep(this.$_admate_row.data)
      }
      this.$_admate_getListProxy('init')
    },
    mounted () {
      // fixing: 没有声明的筛选参数无法重置
      if (this.$refs.listFilter?.fields) {
        let obj = {}
        Array.from(this.$refs.listFilter.fields, (v: any) => v.labelFor)?.map(v => {
          obj[v] = undefined
        })
        this.$_admate_list.filter = {
          ...obj,
          ...this.$_admate_list.filter,
        }
      }

      this.$watch('$_admate_list.filter', newVal => {
        if (!this.$_admate_getListThrottle) {
          this.$_admate_getListThrottle = throttle(() => {
            const callback = valid => {
              if (valid) {
                const pageNoField = this.$_admate_props.pageNo

                // 如果改变的不是页码 页码重置为1
                if (this.$_admate_list.prevPageNo === newVal[pageNoField]) {
                  this.$_admate_list.filter[pageNoField] === 1 ?
                    this.$_admate_getListProxy('filterChange') :
                    this.$_admate_list.filter[pageNoField] = 1
                } else {
                  // 刷新列表
                  this.$_admate_getListProxy('pageNoChange')
                }
                this.$_admate_list.prevPageNo = newVal[pageNoField]
              }
            }
            if (this.$refs.listFilter) {
              this.$refs.listFilter.validate(callback)
            } else {
              console.warn(prefix + '未找到$refs.listFilter')
              callback(true)
            }
          }, 500, {
            leading: false, // true会导致：如果调用≥2次 则至少触发2次 但此时可能只期望触发1次
            trailing: true
          })
        }

        this.$_admate_getListThrottle()
      }, {
        deep: true
      })
    },
    destroyed () {
      // 页面销毁时如果还有查询请求 中止掉
      this.$_admate_list.cancelToken?.()
      this.$_admate_row.cancelToken?.()
      /*    let initData = getInitData()
          for (let k in this.$data) {
            // delete this[k]
            this[k] = initData[k]
          }*/
      Object.assign(this.$data, getInitData())
    },
    methods: {
      $_admate_getList () {
        this.$_admate_list.loading = true
        this.$_admate_list.data.length = 0
        return new Promise((resolve, reject) => {
          this.$_admate_api.list(this.$_admate_list.filter, 'param', {
            cancelToken: CancelToken && new CancelToken(c => {
              // executor 函数接收一个 cancel 函数作为参数
              this.$_admate_list.cancelToken = c
            })
          })
          .then(res => {
            // 在快速切换页面时（上一个页面的接口调用还未结束就切换到下一个页面） 在data被清空的空隙 this.$_admate_props为空
            // 不能采用给this.$_admate_props赋初值来解决 因为自定义的全局props会被该初值覆盖
            if (this.$_admate_props) {
              for (let v of this.$_admate_props.list) {
                const list = getPropByPath(res, v)
                if (list instanceof Array) {
                  this.$_admate_list.data = list
                  this.$_admate_list.total = getPropByPath(res, this.$_admate_props.total)
                  break
                }
              }
              if (isEmpty(this.$_admate_list.data)) {
                this.$_admate_list.total = 0
              }
            }
            resolve(res)
          })
          .catch(res => {
            reject(res)
          })
          .finally(e => {
            this.$_admate_list.cancelToken = null
            this.$_admate_list.loading = false
          })
        })
      },
      $_admate_c () {
        this.$_admate_row.status = 'c'
        this.$_admate_row.show = true
      },
      /**
       * @param {object|FormData} obj - 必传
       * @param {string} objIs - 指定参数1的用途 默认'param'
       */
      $_admate_r (
        obj: object | FormData,
        objIs = 'param'
      ) {
        argsHandler(obj, objIs, 'r', this.$_admate_row)
      },
      /**
       * @param {object|FormData} obj - 必传
       * @param {string} objIs - 指定参数1的用途 默认'param'
       */
      $_admate_u (
        obj: object | FormData,
        objIs = 'param'
      ) {
        argsHandler(obj, objIs, 'u', this.$_admate_row)
      },
      /**
       * @param {object|FormData} obj - 必传
       * @param {string} objIs - 指定参数1的用途 默认'param'
       */
      $_admate_d (
        obj: object | FormData,
        objIs = 'param'
      ) {
        argsHandler(obj, objIs, 'd', this.$_admate_row)
        this.$_admate_list.loading = true
        this.$_admate_api.d(obj, objIs).then(res => {
          if (this.$_admate_list.data?.length === 1) {
            if (this.$_admate_list.filter[this.$_admate_props.pageNo] === 1) {
              this.$_admate_getListProxy('d', res)
            } else {
              this.$_admate_list.filter[this.$_admate_props.pageNo]--
            }
          } else {
            this.$_admate_getListProxy('d', res)
          }
        }).finally(e => {
          this.$_admate_list.loading = false
        })
      },
      /**
       * @param {object|FormData} obj - 必传
       * @param {string} objIs - 指定参数1的用途 默认'param'
       */
      $_admate_updateStatus (
        obj: object | FormData,
        objIs = 'param'
      ) {
        argsHandler(obj, objIs, 'updateStatus', this.$_admate_row)
        this.$_admate_list.loading = true
        this.$_admate_api.updateStatus(obj, objIs).then(res => {
          this.$_admate_getListProxy('updateStatus', res)
        }).finally(e => {
          this.$_admate_list.loading = false
        })
      },
      /**
       * @param {object|FormData} obj - 必传
       * @param {string} objIs - 指定参数1的用途 默认'param'
       */
      $_admate_enable (
        obj: object | FormData,
        objIs = 'param'
      ) {
        argsHandler(obj, objIs, 'enable', this.$_admate_row)
        this.$_admate_list.loading = true
        this.$_admate_api.enable(obj, objIs).then(res => {
          this.$_admate_getListProxy('enable', res)
        }).finally(e => {
          this.$_admate_list.loading = false
        })
      },
      /**
       * @param {object|FormData} obj - 必传
       * @param {string} objIs - 指定参数1的用途 默认'param'
       */
      $_admate_disable (
        obj: object | FormData,
        objIs = 'param'
      ) {
        argsHandler(obj, objIs, 'disable', this.$_admate_row)
        this.$_admate_list.loading = true
        this.$_admate_api.disable(obj, objIs).then(res => {
          this.$_admate_getListProxy('disable', res)
        }).finally(e => {
          this.$_admate_list.loading = false
        })
      },
      /**
       * @return {Promise} 查询单条接口调用
       */
      $_admate_retrieve () {
        // 仅查看和编辑才调用
        if (!['r', 'u'].includes(this.$_admate_row.status)) {
          return
        }

        return new Promise((resolve, reject) => {
          this.$_admate_api.r(
            this.$_admate_row.obj,
            this.$_admate_row.objIs,
            {
              cancelToken: CancelToken && new CancelToken(c => {
                // executor 函数接收一个 cancel 函数作为参数
                this.$_admate_row.cancelToken = c
              })
            })
          .then(res => {
            const rowData = getPropByPath(res, this.$_admate_props.r)
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
            resolve(rowData)
            // 将接口返回值混入$_admate_row.data
            this.$_admate_row.data = {
              ...this.$_admate_row.data,
              ...rowData
            }
          })
          .catch(e => {
            reject(e)
          })
          .finally(() => {
            this.$_admate_row.cancelToken = null
          })
        })
      },
      /**
       * @param {function|object|FormData} paramHandler - 提交之前的钩子或指定表单参数
       * @return {Promise} 提交表单接口调用
       */
      $_admate_submit (paramHandler?: (Function) | object | FormData) {
        let param = this.$_admate_row.data
        if (paramHandler) {
          if (paramHandler instanceof Function) {
            paramHandler()
          } else if (isPlainObject(paramHandler) || paramHandler instanceof FormData) {
            param = paramHandler
          } else {
            console.error(prefix + '$_admate_submit的参数类型仅能为function|object|FormData')
          }
        }
        return this.$_admate_api[this.$_admate_row.status](param).then(res => {
          this.$_admate_row.obj = {}
          this.$_admate_row.objIs = null
          this.$_admate_getListProxy(this.$_admate_row.status, res)
        })
      },
    }
  }
}

export default getMixins
