import {
  ref,
  reactive,
  toRefs,
  computed,
  watch,
  onMounted,
  getCurrentInstance,
} from 'vue'
//from '@vue/composition-api' // ≤ vue@2.6
import { isVue2 } from 'vue-demi'
import request from './request'
import useAdmate from '../src'
import { merge } from 'lodash-es'
import qs from 'qs'

export default (admateConfig, {
  // 自定义表单名称
  formTitleHash = {
    c: '新增',
    r: '查看',
    u: '编辑'
  },

  // 在 mounted 时获取列表
  // fix: 由于 Object.defineProperty 对不存在的属性无法拦截，需要给筛选项赋初值，使得重置功能能够正常工作（仅 Vue 2需要）
  getListOnMounted = isVue2,

  // 筛选参数校验
  validateListFilter,

  // 表单校验
  validateFormData,

  // 表单校验重置
  clearFormDataValidation,

  // 操作成功提示
  toast,

  // 列表筛选参数的初始值，用于动态获取的参数，比如时间
  // 时间类的参数，如果直接绑定在 list.filter 中，在重置时，时间不会更新
  // 所以需要调方法动态获取
  initialListFilter,

  // 自定义钩子函数 - 获取列表之后
  // 参数1为接口返回值，参数2为触发动机
  // 可访问 this
  afterGetList,

  // 自定义钩子函数 - 查询表单详情之后（新增时不触发）
  // 参数为接口返回值
  // 可访问 this
  afterRetrieve,

  // 自定义钩子函数 - 打开表单之后
  // 参数为接口返回值（新增时为空）
  // 可访问 this
  afterOpenForm,

  // 自定义钩子函数 - 提交表单之前
  // 参数为 form
  // 可访问 this
  beforeSubmit,
} = {}) => {
  // 获取当前 Vue 实例
  const currentInstance = ref()

  // 初始化 admate
  const admate = useAdmate(merge({
    axios: request,
    axiosConfig: {
      c: {
        url: 'create',
        method: 'POST'
      },
      r: {
        url: 'queryForDetail',
        method: 'POST'
      },
      u: {
        url: 'update',
        method: 'POST'
      },
      d: {
        url: 'delete',
        method: 'POST'
      },
      getList: {
        url: 'queryForPage',
        method: 'POST'
      },
      updateStatus: {
        url: 'updateStatus',
        method: 'POST'
      }
    },
    list: {
      // 查询列表接口的默认参数
      filter: {
        // 页容量
        // 注意：如果修改了默认值，需要同步修改 el-pagination 组件 pageSize 参数的值
        pageSize: 10,

        // 动态的默认参数
        ...initialListFilter?.(),

        // 支持路由传参
        // 因为 qs 支持数组，所以没有使用 vue-router
        // 跳转方式：
        // this.$router.push('path' + qs.stringify(query, { addQueryPrefix: true }))
        ...qs.parse(window.location.hash.split('?')[1]),
      },
      dataAt: 'data.records',
      totalAt: 'data.total',
      pageNumberKey: 'pageNo'
    },
    form: {
      dataAt: 'data'
    },
    getListProxy(getList, trigger) {
      // onMounted 中给筛选项赋初值已经触发调用
      if (trigger === 'init') {
        return
      }

      function GetList() {
        getList().then(response => {
          afterGetList?.(response, trigger)
        })
      }

      if (trigger === 'filterChange') {
        if (validateListFilter) {
          validateListFilter().then(() => {
            GetList()
          })
        } else {
          GetList()
        }
      } else {
        GetList()
        if (['c', 'u', 'd', 'updateStatus', 'enable', 'disable'].includes(trigger)) {
          toast()
        }
      }
    },
    openFormProxy(openForm) {
      // 打开表单后的回调
      function callback(res) {
        afterOpenForm?.(res)
        if (
          admate.form.status !== 'c' ||
          currentInstance.value?.createFromCopy__
        ) {
          afterRetrieve?.(res)
        }

        // 回显表单后，清除校验
        setTimeout(() => {
          clearFormDataValidation()
        }, 0)
      }

      const promise = openForm()
      if (promise) {
        return new Promise((resolve, reject) => {
          promise.then(res => {
            callback(res)
            resolve()
          }).catch(e => {
            callback(e)
            console.error(e)
            reject()
          })
        })
      } else {
        // 新增、复用列表数据时 openForm 没有返回值
        callback()
      }
    },
    submitFormProxy(submitForm) {
      return new Promise((resolve, reject) => {
        const proceed = () => {
          submitForm().then(res => {
            resolve()
          }).catch(e => {
            console.error(e)
            reject()
          })
        }

        validateFormData().then(() => {
          const result = beforeSubmit?.(admate.form)
          if (result instanceof Promise) {
            result.then(() => {
              proceed()
            })
          } else if (result !== false) {
            proceed()
          }
        })
      })
    },
  },
    admateConfig
  ))

  const listFilterRef = ref(null)
  const formRef = ref(null)

  // 关闭表单时，清除校验
  watch(() => admate.form.show, n => {
    if (!n) {
      setTimeout(() => {
        clearFormDataValidation()
      }, 500)
    }
  })

  if (!getListOnMounted) {
    admate.getList()
  }

  onMounted(() => {
    currentInstance.value = getCurrentInstance().proxy

    afterGetList = afterGetList?.bind(currentInstance.value)
    afterRetrieve = afterRetrieve?.bind(currentInstance.value)
    afterOpenForm = afterOpenForm?.bind(currentInstance.value)
    beforeSubmit = beforeSubmit?.bind(currentInstance.value)

    if (getListOnMounted) {
      if (currentInstance.value.$refs.listFilterRef) {
        // fix: 由于 Object.defineProperty 对不存在的属性无法拦截，需要给筛选项赋初值，使得重置功能能够正常工作（仅 Vue 2需要）
        admate.list.filter = {
          ...Object.fromEntries(
            Array.from(
              currentInstance.value.$refs.listFilterRef.fields || [],
              v => [v.labelFor, undefined]
            )
          ),
          ...admate.list.filter
        }
      } else {
        admate.getList()
      }
    }
  })

  return toRefs(reactive({
    ...admate,
    c: (...args) => {
      admate.form.status = 'c'
      // 复制新增需要传参，常规新增不需要
      return admate.openForm(
        ...(currentInstance.value.createFromCopy__ ? args : [])
      )
    },
    r: (...args) => {
      admate.form.status = 'r'
      return admate.openForm(...args)
    },
    u: (...args) => {
      admate.form.status = 'u'
      return admate.openForm(...args)
    },
    // 单条记录表单的标题
    formTitle: computed(() =>
      currentInstance.value?.createFromCopy__
        ? '复制新增'
        : formTitleHash[admate.form.status]
    ),
    // 重置筛选条件
    reset: () => {
      currentInstance.value.$refs.listFilterRef.resetFields()
      if (initialListFilter) {
        admate.list.filter = {
          ...admate.list.filter,
          ...initialListFilter(),
        }
      }
    },
    // 查询列表（监听筛选条件时不需要）
    queryList: () => {
      currentInstance.value.$refs.listFilterRef.validate().then(() => {
        admate.list.filter.pageNo = 1
        admate.getList()
      })
    },
    // 监听页码切换（监听筛选条件时不需要）
    onPageNumberChange: () => {
      if (!admate.list.watchFilter) {
        admate.getList()
      }
    },
    // 当前 Vue 实例
    currentInstance,
    // 列表筛选条件表单的 ref
    listFilterRef,
    // 单条记录表单的 ref
    formRef
  }))
}
