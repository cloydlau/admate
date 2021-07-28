import { isEmpty, notEmpty } from 'kayran'
import { throttle, cloneDeep, isPlainObject, at } from 'lodash-es'
import { cancelAllRequest } from './api-generator'
import { name } from '../package.json'
const prefix = `[${name}] `

function getInitialData () {
  return {
    props__: null,
    list__: {
      data: [],
      loading: false,
      total: 0,
      filter: {},
      prevPageNo: 1,
    },
    row__: {
      loading: false,
      show: false,
      data: {},
      initialData: {},
      payload: {},
      payloadUse: null,
      status: '',
    },
  }
}

function argsHandler (payload = {}, payloadUse = 'data', motive, row__) {
  const isRorU = ['r', 'u'].includes(motive)
  switch (payloadUse) {
    case 'data':
      break
    case 'params':
      break
    case 'config':
      break
    case 'raw':
      if (!isRorU) {
        throw Error(`${prefix}只有r__和u__的参数2可以使用'raw'`)
      }
      if (notEmpty(payload) && !isPlainObject(payload)) {
        throw Error(`${prefix}直接使用列表数据时，参数1的类型需为object`)
      }
      break
    default:
      throw Error(`${prefix}${motive}__的参数2需为'params'/'data'/'config'${isRorU ? `'/raw'` : ''}`)
  }

  row__.payload = payloadUse === 'raw' ? cloneDeep(payload) : payload
  row__.payloadUse = payloadUse

  if (isRorU) {
    row__.status = motive
    row__.show = true
  }
}

function createMixin ({
  props,
  getListProxy,
}: {
  props?: object
  getListProxy?: Function
}): object {
  props = {
    pageNo: 'pageNo',
    pageSize: 'pageSize',
    total: 'data.total',
    list: ['data', 'data.records', 'data.list'], // 不分页/分页两种情况 data.list为兼容性代码
    r: 'data',
    ...props
  }

  getListProxy ||= this.getList__

  return {
    data () {
      return cloneDeep(getInitialData())
    },
    watch: {
      async 'row__.show' (newVal) {
        if (!newVal) {
          // 如果弹框readonly状态在弹框关闭动画结束之前改变 将导致弹框的按钮显隐错乱
          //setTimeout(() => {
          this.row__.status = ''
          //}, 300)
          this.row__.data = cloneDeep(this.row__.initialData)
          this.row__.payload = {}
          this.row__.payloadUse = null
          this.$refs.rowForm && this.$refs.rowForm.clearValidate()
          this.row__.loading = false
        }
      }
    },
    /*beforeCreate() {
          for (let k in initialData) {
            this[k] = initialData[k]
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

      this.getListProxy__ = this.getListProxy__ || getListProxy

      this.list__.filter = {
        [this.props__.pageNo]: 1,
        [this.props__.pageSize]: this.list__.filter[this.props__.pageSize] || 10,
        ...this.list__.filter
      }

      if (Object.getOwnPropertyNames(this.row__.data).length > 0) {
        this.row__.initialData = cloneDeep(this.row__.data)
      }
      this.getListProxy__('init')
    },
    mounted () {
      // fix: 没有声明的筛选参数无法重置
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
        if (!this.getListThrottled__) {
          this.getListThrottled__ = throttle(() => {
            const callback = async valid => {
              if (valid) {
                const pageNoField = this.props__.pageNo

                // 如果改变的不是页码 页码重置为1
                if (this.list__.prevPageNo === newVal[pageNoField]) {
                  this.list__.filter[pageNoField] === 1 ?
                    await this.getListProxy__('filterChange') :
                    this.list__.filter[pageNoField] = 1
                } else {
                  // 刷新列表
                  await this.getListProxy__('pageNoChange')
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

        this.getListThrottled__()
      }, {
        deep: true
      })
    },
    destroyed () {
      // 页面销毁时如果还有查询请求 中止掉
      cancelAllRequest()
      /*    let initialData = getInitialData()
          for (let k in this.$data) {
            // delete this[k]
            this[k] = initialData[k]
          }*/
      Object.assign(this.$data, getInitialData())
    },
    methods: {
      getList__ () {
        this.list__.loading = true
        this.list__.data.length = 0
        return new Promise((resolve, reject) => {
          this.api__.list(this.list__.filter, 'param')
          .then(res => {
            // 在快速切换页面时（上一个页面的接口调用还未结束就切换到下一个页面） 在data被清空的空隙 this.props__为空
            // 不能采用给this.props__赋初值来解决 因为自定义的全局props会被该初值覆盖
            if (this.props__) {
              for (let v of at(res, this.props__.list)) {
                if (Array.isArray(v)) {
                  this.list__.data = v
                  this.list__.total = at(res, this.props__.total)[0]
                  break
                }
              }
              if (isEmpty(this.list__.data)) {
                this.list__.total = 0
              }
            }
            resolve(res)
          })
          .catch(res => {
            reject(res)
          })
          .finally(e => {
            this.list__.loading = false
          })
        })
      },
      c__ () {
        this.row__.status = 'c'
        this.row__.show = true
      },
      r__ (payload?, payloadUse?: string) {
        argsHandler(payload, payloadUse, 'r', this.row__)
      },
      u__ (payload?, payloadUse?: string) {
        argsHandler(payload, payloadUse, 'u', this.row__)
      },
      d__ (payload?, payloadUse?: string) {
        argsHandler(payload, payloadUse, 'd', this.row__)
        this.list__.loading = true
        this.api__.d(payload, payloadUse,).then(async res => {
          if (this.list__.data?.length === 1) {
            if (this.list__.filter[this.props__.pageNo] === 1) {
              await this.getListProxy__('d', res)
            } else {
              this.list__.filter[this.props__.pageNo]--
            }
          } else {
            await this.getListProxy__('d', res)
          }
        }).finally(e => {
          this.list__.loading = false
        })
      },
      updateStatus__ (payload?, payloadUse?: string) {
        argsHandler(payload, payloadUse, 'updateStatus', this.row__)
        this.list__.loading = true
        this.api__.updateStatus(payload, payloadUse,).then(async res => {
          await this.getListProxy__('updateStatus', res)
        }).finally(e => {
          this.list__.loading = false
        })
      },
      enable__ (payload?, payloadUse?: string) {
        argsHandler(payload, payloadUse, 'enable', this.row__)
        this.list__.loading = true
        this.api__.enable(payload, payloadUse,).then(async res => {
          await this.getListProxy__('enable', res)
        }).finally(e => {
          this.list__.loading = false
        })
      },
      disable__ (payload?, payloadUse?: string) {
        argsHandler(payload, payloadUse, 'disable', this.row__)
        this.list__.loading = true
        this.api__.disable(payload, payloadUse,).then(async res => {
          await this.getListProxy__('disable', res)
        }).finally(e => {
          this.list__.loading = false
        })
      },
      retrieve__ () {
        // 仅查看和编辑才调用
        if (!['r', 'u'].includes(this.row__.status)) {
          return
        }

        return new Promise((resolve, reject) => {
          const result = this.api__.r(this.row__.payload, this.row__.payloadUse)

          if (this.row__.payloadUse === 'raw') {
            resolve(result)
            this.row__.data = {
              ...this.row__.data,
              ...result
            }
          } else {
            result.then(res => {
              const rowData = at(res, this.props__.r)[0]
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
              // 将接口返回值混入row__.data
              this.row__.data = {
                ...this.row__.data,
                ...rowData
              }
            })
            .catch(e => {
              reject(e)
            })
          }
        })
      },
      async submit__ (paramsHandler?) {
        let params = this.row__.data
        if (typeof paramsHandler === 'function') {
          await paramsHandler()
        } else if (paramsHandler !== undefined) {
          params = paramsHandler
        }
        return this.api__[this.row__.status](params).then(async res => {
          await this.getListProxy__(this.row__.status, res)
        })
      },
    }
  }
}

export default createMixin
