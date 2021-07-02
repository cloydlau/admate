import { isEmpty } from 'kayran'
import { throttle, cloneDeep, isPlainObject, at } from 'lodash-es'
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

function argsHandler (obj, objIs, motive, row__) {
  const isRorU = ['r', 'u'].includes(motive)
  switch (objIs) {
    case 'param':
      if (!(isPlainObject(obj) || obj instanceof FormData)) {
        throw Error(`${prefix} ${motive}__的第一个参数的类型需为 object|FormData`)
      }
      break
    case 'config':
      break
    case 'data':
      if (!isRorU) {
        throw Error(`${prefix}' ${motive}__的第二个参数需为 'param' 'config' 之一`)
      }
      if (!(isPlainObject(obj))) {
        throw Error(`${prefix}'直接使用列表数据时 ${motive}__的第一个参数的类型需为 object'`)
      }
      break
    default:
      throw Error(`${prefix}' ${motive}__的第二个参数需为 'param' ${isRorU ? 'data ' : ''}'config' 之一`)
  }

  row__.obj = objIs === 'data' ? cloneDeep(obj) : obj
  row__.objIs = objIs

  if (isRorU) {
    row__.status = motive
    row__.show = true
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

  getListProxy = getListProxy || this.getList__

  return {
    data () {
      return cloneDeep(getInitData())
    },
    watch: {
      async 'row__.show' (newVal) {
        if (!newVal) {
          // 如果弹框readonly状态在弹框关闭动画结束之前改变 将导致弹框的按钮显隐错乱
          //setTimeout(() => {
          this.row__.status = ''
          //}, 300)
          this.row__.data = cloneDeep(this.row__.initData)
          this.row__.obj = {}
          this.row__.objIs = null
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

      this.getListProxy__ = this.getListProxy__ || getListProxy

      this.list__.filter = {
        [this.props__.pageNo]: 1,
        [this.props__.pageSize]: this.list__.filter[this.props__.pageSize] || 10,
        ...this.list__.filter
      }

      if (Object.getOwnPropertyNames(this.row__.data).length > 0) {
        this.row__.initData = cloneDeep(this.row__.data)
      }
      this.getListProxy__('init')
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
      getList__ () {
        this.list__.loading = true
        this.list__.data.length = 0
        return new Promise((resolve, reject) => {
          this.api__.list(this.list__.filter, 'param', {
            cancelToken: CancelToken && new CancelToken(c => {
              // executor 函数接收一个 cancel 函数作为参数
              this.list__.cancelToken = c
            })
          })
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
            this.list__.cancelToken = null
            this.list__.loading = false
          })
        })
      },
      c__ () {
        this.row__.status = 'c'
        this.row__.show = true
      },
      /**
       * @param {object|FormData} obj - 必传
       * @param {string} objIs - 指定参数1的用途 默认'param'
       */
      r__ (
        obj: object | FormData,
        objIs = 'param'
      ) {
        argsHandler(obj, objIs, 'r', this.row__)
      },
      /**
       * @param {object|FormData} obj - 必传
       * @param {string} objIs - 指定参数1的用途 默认'param'
       */
      u__ (
        obj: object | FormData,
        objIs = 'param'
      ) {
        argsHandler(obj, objIs, 'u', this.row__)
      },
      /**
       * @param {object|FormData} obj - 必传
       * @param {string} objIs - 指定参数1的用途 默认'param'
       */
      d__ (
        obj: object | FormData,
        objIs = 'param'
      ) {
        argsHandler(obj, objIs, 'd', this.row__)
        this.list__.loading = true
        this.api__.d(obj, objIs).then(async res => {
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
      /**
       * @param {object|FormData} obj - 必传
       * @param {string} objIs - 指定参数1的用途 默认'param'
       */
      updateStatus__ (
        obj: object | FormData,
        objIs = 'param'
      ) {
        argsHandler(obj, objIs, 'updateStatus', this.row__)
        this.list__.loading = true
        this.api__.updateStatus(obj, objIs).then(async res => {
          await this.getListProxy__('updateStatus', res)
        }).finally(e => {
          this.list__.loading = false
        })
      },
      /**
       * @param {object|FormData} obj - 必传
       * @param {string} objIs - 指定参数1的用途 默认'param'
       */
      enable__ (
        obj: object | FormData,
        objIs = 'param'
      ) {
        argsHandler(obj, objIs, 'enable', this.row__)
        this.list__.loading = true
        this.api__.enable(obj, objIs).then(async res => {
          await this.getListProxy__('enable', res)
        }).finally(e => {
          this.list__.loading = false
        })
      },
      /**
       * @param {object|FormData} obj - 必传
       * @param {string} objIs - 指定参数1的用途 默认'param'
       */
      disable__ (
        obj: object | FormData,
        objIs = 'param'
      ) {
        argsHandler(obj, objIs, 'disable', this.row__)
        this.list__.loading = true
        this.api__.disable(obj, objIs).then(async res => {
          await this.getListProxy__('disable', res)
        }).finally(e => {
          this.list__.loading = false
        })
      },
      /**
       * @return {Promise} 查询单条接口调用
       */
      retrieve__ () {
        // 仅查看和编辑才调用
        if (!['r', 'u'].includes(this.row__.status)) {
          return
        }

        return new Promise((resolve, reject) => {
          if (this.row__.objIs === 'data') {
            resolve(this.row__.obj)
            this.row__.data = {
              ...this.row__.data,
              ...this.row__.obj
            }
          } else {
            this.api__.r(
              this.row__.obj,
              this.row__.objIs,
              {
                cancelToken: CancelToken && new CancelToken(c => {
                  // executor 函数接收一个 cancel 函数作为参数
                  this.row__.cancelToken = c
                })
              })
            .then(res => {
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
            .finally(() => {
              this.row__.cancelToken = null
            })
          }
        })
      },
      /**
       * @param {function|object|FormData} paramHandler - 提交之前的钩子或指定表单参数
       * @return {Promise} 提交表单接口调用
       */
      async submit__ (paramHandler?: (Function) | object | FormData) {
        let param = this.row__.data
        if (paramHandler) {
          if (paramHandler instanceof Function) {
            await paramHandler()
          } else if (isPlainObject(paramHandler) || paramHandler instanceof FormData) {
            param = paramHandler
          } else {
            console.error(prefix + 'submit__的参数类型仅能为function|object|FormData')
          }
        }
        return this.api__[this.row__.status](param).then(async res => {
          await this.getListProxy__(this.row__.status, res)
        })
      },
    }
  }
}

export default getMixins
