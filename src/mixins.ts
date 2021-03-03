import { isEmpty, getPropByPath } from 'kayran'
import { throttle, cloneDeep, isPlainObject } from 'lodash-es'
import { name } from '../package.json'
const prefix = `[${name}] `

function getInitData () {
  return {
    props__: null,
    list__: {
      data: [],
      loading: false,
      total: 0,
      filter: {},
      prevPageNo: 1,
      cancelToken: null
    },
    row__: {
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

function getMixins ({
  props,
  onSuccess,
  CancelToken,
}: {
  props?: object
  onSuccess?: () => void
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

  return {
    data () {
      return cloneDeep(getInitData())
    },
    watch: {
      async 'row__.show' (newVal) {
        if (!newVal) {
          // 如果弹框readonly状态在弹框关闭动画结束之前改变 将导致弹框的按钮显隐错乱
          setTimeout(() => {
            this.row__.status = ''
          }, 300)

          this.row__.data = cloneDeep(this.row__.initData)
          this.$refs.rowForm && this.$refs.rowForm.clearValidate()
          this.row__.loading = false
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

      if (!this.api__) {
        throw new Error(prefix + 'data中未找到api__')
      }

      /**
       * 初始化接口参数、返回值格式
       */
      this.props__ = {
        ...props,
        ...this.props__
      }
      if (!(this.props__.list instanceof Array)) {
        this.props__.list = [this.props__.list]
      }
      this.list__.filter = {
        [this.props__.pageNo]: 1,
        [this.props__.pageSize]: this.list__.filter[this.props__.pageSize] || 10,
        ...this.list__.filter
      }

      if (Object.getOwnPropertyNames(this.row__.data).length > 0) {
        this.row__.initData = cloneDeep(this.row__.data)
      }
      typeof this.init__ === 'function' ? this.init__('init') : this.getList__()
    },
    mounted () {
      // fixing: 没有声明的筛选参数无法重置
      if (this.$refs.listFilter?.fields) {
        let obj = {}
        Array.from(this.$refs.listFilter.fields, (v: any) => v.labelFor)?.map(v => {
          obj[v] = undefined
        })
        this.list__.filter = {
          ...obj,
          ...this.list__.filter,
        }
      }

      this.$watch('list__.filter', newVal => {
        if (!this.getListThrottle__) {
          this.getListThrottle__ = throttle(() => {
            const callback = valid => {
              if (valid) {
                const pageNoField = this.props__.pageNo

                // 如果改变的不是页码 页码重置为1
                if (this.list__.prevPageNo === newVal[pageNoField]) {
                  this.list__.filter[pageNoField] === 1 ?
                    (typeof this.init__ === 'function' ? this.init__('filterChange') : this.getList__()) :
                    this.list__.filter[pageNoField] = 1
                } else {
                  // 刷新列表
                  typeof this.init__ === 'function' ? this.init__('pageNoChange') : this.getList__()
                }
                this.list__.prevPageNo = newVal[pageNoField]
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

        this.getListThrottle__()
      }, {
        deep: true
      })
    },
    destroyed () {
      // 页面销毁时如果还有查询请求 中止掉
      this.list__.cancelToken?.()
      this.row__.cancelToken?.()
      /*    let initData = getInitData()
          for (let k in this.$data) {
            // delete this[k]
            this[k] = initData[k]
          }*/
      Object.assign(this.$data, getInitData())
    },
    methods: {
      getList__ (callback) {
        this.list__.loading = true
        this.list__.data.length = 0
        this.api__.list(this.list__.filter, 'param', {
          cancelToken: CancelToken && new CancelToken(c => {
            // executor 函数接收一个 cancel 函数作为参数
            this.list__.cancelToken = c
          })
        }).then(res => {
          // 在快速切换页面时（上一个页面的接口调用还未结束就切换到下一个页面） 在data被清空的空隙 this.props__为空
          // 不能采用给this.props__赋初值来解决 因为自定义的全局props会被该初值覆盖
          if (this.props__) {
            for (let v of this.props__.list) {
              const list = getPropByPath(res, v)
              if (list instanceof Array) {
                this.list__.data = list
                this.list__.total = getPropByPath(res, this.props__.total)
                break
              }
            }
            if (isEmpty(this.list__.data)) {
              this.list__.total = 0
            }
          }
          callback?.(res)
        }).finally(e => {
          this.list__.cancelToken = null
          this.list__.loading = false
        })
      },
      c__ () {
        this.row__.status = 'c'
        this.row__.show = true
      },
      r__ (obj: object | FormData, objIs = this.api__.r === false ? 'data' : 'param') {
        this.row__.objIs = objIs
        if (objIs === 'data') {
          if (!(isPlainObject(obj))) {
            throw Error(prefix + '直接使用列表数据时 r__的第一个参数的类型需为object')
          }
          this.row__.obj = cloneDeep(obj)
        } else {
          if (objIs === 'param' && !(isPlainObject(obj) || obj instanceof FormData)) {
            throw Error(prefix + 'r__的第一个参数的类型需为object|FormData')
          }
          this.row__.obj = obj
        }
        this.row__.status = 'r'
        this.row__.show = true
      },
      u__ (obj: object | FormData, objIs = this.api__.r === false ? 'data' : 'param') {
        this.row__.objIs = objIs
        if (objIs === 'data') {
          if (!(isPlainObject(obj))) {
            throw Error(prefix + '直接使用列表数据时 u__的第一个参数的类型需为object')
          }
          this.row__.obj = cloneDeep(obj)
        } else {
          if (objIs === 'param' && !(isPlainObject(obj) || obj instanceof FormData)) {
            throw Error(prefix + 'u__的第一个参数的类型需为object|FormData')
          }
          this.row__.obj = obj
        }
        this.row__.status = 'u'
        this.row__.show = true
      },
      d__ (obj: object | FormData, objIs = 'param') {
        this.row__.objIs = objIs
        if (!(isPlainObject(obj) || obj instanceof FormData)) {
          throw Error(prefix + 'd__的第一个参数的类型仅能为object|FormData')
        }
        this.list__.loading = true
        this.api__.d(obj, objIs).then(res => {
          if (this.list__.data?.length === 1) {
            if (this.list__.filter[this.props__.pageNo] === 1) {
              typeof this.init__ === 'function' ? this.init__('d', res) : this.getList__()
            } else {
              this.list__.filter[this.props__.pageNo]--
            }
          } else {
            typeof this.init__ === 'function' ? this.init__('d', res) : this.getList__()
          }
          onSuccess?.()
        }).finally(e => {
          this.list__.loading = false
        })
      },
      updateStatus__ (obj: object | FormData, objIs = 'param') {
        this.row__.objIs = objIs
        if (!(isPlainObject(obj) || obj instanceof FormData)) {
          throw Error(prefix + 'updateStatus__的第一个参数的类型仅能为object|FormData')
        }
        this.list__.loading = true
        this.api__.updateStatus(obj, objIs).then(res => {
          typeof this.init__ === 'function' ? this.init__('updateStatus', res) : this.getList__()
          onSuccess?.()
        }).finally(e => {
          this.list__.loading = false
        })
      },
      dataGetter__ (
        afterRetrieve?: (rowData: object) => void,
        beforeRetrieve?: () => void
      ) {
        // 仅查看和编辑才调用
        if (!['r', 'u'].includes(this.row__.status)) {
          return
        }

        beforeRetrieve?.()

        return this.api__.r?.(
          this.row__.obj,
          this.row__.objIs,
          {
            cancelToken: CancelToken && new CancelToken(c => {
              // executor 函数接收一个 cancel 函数作为参数
              this.row__.cancelToken = c
            })
          })
        .then(res => {
          const rowData = getPropByPath(res, this.props__.r)
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
          afterRetrieve?.(rowData)
          // 将接口返回值混入row__.data
          this.row__.data = {
            ...this.row__.data,
            ...rowData
          }
        })
        .finally(() => {
          this.row__.cancelToken = null
        })
      },
      submit__ (beforeSubmitting?: (() => void) | object | FormData) {
        let param = this.row__.data
        if (beforeSubmitting) {
          if (beforeSubmitting instanceof Function) {
            beforeSubmitting()
          } else if (isPlainObject(beforeSubmitting) || beforeSubmitting instanceof FormData) {
            param = beforeSubmitting
          } else {
            console.error(prefix + 'submit__的参数类型仅能为function|object|FormData')
          }
        }
        return this.api__[this.row__.status](param).then(res => {
          this.row__.obj = {}
          this.row__.objIs = null
          typeof this.init__ === 'function' ? this.init__(this.row__.status, res) : this.getList__()
          onSuccess?.()
        })
      },
    }
  }
}

export default getMixins
