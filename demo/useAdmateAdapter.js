import {
  ref,
  toRefs,
  watch,
  reactive,
  computed,
  onMounted,
  getCurrentInstance,
} from 'vue' // TODO
//from '@vue/composition-api' // ≤ vue@2.6
import { isVue2 } from 'vue-demi' // TODO
import useAdmate from '../src' // TODO
import request from './request' // TODO
import { merge } from 'lodash-es'
import qs from 'qs'

export default (admateConfig, {
  // 表单标题
  formTitleHash = {
    c: '新增',
    r: '查看',
    u: '编辑'
  },

  // 是否在 mounted 时再查询列表
  // 作用：给筛选项赋初值，使得重置功能能够正常工作
  getListOnMounted = isVue2, // TODO

  // 列表筛选参数的初始值，用于动态获取的参数，比如时间
  // 时间类的参数，如果直接绑定在 list.filter 中，在重置时，时间不会更新
  // 所以需要调方法动态获取
  // 可访问 this
  initialListFilter = () => { },

  // 获取列表筛选项的表单 ref
  // 可访问 this
  getElFormRefOfListFilter = function () {
    return this.$refs.listFilterRef
  },

  // 校验列表筛选项
  // 可访问 this
  validateListFilter = function () {
    return getElFormRefOfListFilter()?.validate()
  },

  // 重置列表筛选项
  // 可访问 this
  resetListFilter = function () {
    return getElFormRefOfListFilter().resetFields()
  },

  // 获取详情的表单 ref
  // 可访问 this
  // this 判空原因：只有表单没有列表时，openForm 会在 setup 时执行
  getElFormRefOfFormData = function () {
    return this?.$refs.formRef // TODO
  },

  // 清除详情表单校验
  // 可访问 this
  clearValidateOfFormData = function () {
    return getElFormRefOfFormData()?.clearValidate()
  },

  // 校验详情表单
  // 可访问 this
  validateFormData = function () {
    return getElFormRefOfFormData().validate()
  },

  // 自定义钩子函数 - 获取列表之后
  // 参数1为接口返回值，参数2为触发动机
  // 可访问 this
  afterGetList = () => { },

  // 自定义钩子函数 - 查询表单详情之后（新增时不触发）
  // 参数为接口返回值
  // 可访问 this
  afterRetrieve = () => { },

  // 自定义钩子函数 - 打开表单之后
  // 参数为接口返回值（新增时为空）
  // 可访问 this
  afterOpenForm = () => { },

  // 自定义钩子函数 - 提交表单之前
  // 参数为 form
  // 可访问 this
  beforeSubmit = () => { },
} = {}) => {
  // 获取当前 Vue 实例
  const currentInstance = ref()
  // 列表筛选项的 ref
  const listFilterRef = ref()
  // 详情的 ref
  const formRef = ref()

  // 初始化 admate
  const {
    list,
    getList,
    form,
    openForm,
    submitForm,
    d,
    enable,
    disable,
    updateStatus,
  } = useAdmate(merge({
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
        ...initialListFilter(),

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
      dataAt: 'data',
    },
    getListProxy(getList, trigger) {
      // onMounted 中给筛选项赋初值已经触发调用
      if (getListOnMounted && trigger === 'init') {
        return
      }

      function GetList() {
        getList().then(response => {
          afterGetList(response, trigger)
        })
      }

      if (trigger === 'filterChange') {
        const promise = validateListFilter()
        if (promise) {
          promise.then(() => {
            GetList()
          })
        } else {
          GetList()
        }
      } else {
        GetList()
        if (['c', 'u', 'd', 'updateStatus', 'enable', 'disable'].includes(trigger)) {
          alert('操作成功') // TODO
        }
      }
    },
    openFormProxy(openForm) {
      // 打开表单后的回调
      function callback(res) {
        afterOpenForm(res)
        if (
          form.status !== 'c' ||
          currentInstance.value?.createFromCopy__
        ) {
          afterRetrieve(res)
        }

        // 回显表单后，清除校验
        setTimeout(() => {
          clearValidateOfFormData()
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
          const result = beforeSubmit(form)
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
  }, admateConfig))

  // 关闭表单时，清除校验
  watch(() => form.show, n => {
    if (!n) {
      setTimeout(() => {
        clearValidateOfFormData()
      }, 150)
    }
  })

  onMounted(() => {
    currentInstance.value = getCurrentInstance().proxy

    initialListFilter = initialListFilter.bind(currentInstance.value)
    getElFormRefOfListFilter = getElFormRefOfListFilter.bind(currentInstance.value)
    validateListFilter = validateListFilter.bind(currentInstance.value)
    resetListFilter = resetListFilter.bind(currentInstance.value)

    getElFormRefOfFormData = getElFormRefOfFormData.bind(currentInstance.value)
    clearValidateOfFormData = clearValidateOfFormData.bind(currentInstance.value)
    validateFormData = validateFormData.bind(currentInstance.value)

    afterGetList = afterGetList.bind(currentInstance.value)
    afterRetrieve = afterRetrieve.bind(currentInstance.value)
    afterOpenForm = afterOpenForm.bind(currentInstance.value)
    beforeSubmit = beforeSubmit.bind(currentInstance.value)

    if (getListOnMounted) {
      const elFormRefOfListFilter = getElFormRefOfListFilter()
      if (elFormRefOfListFilter) {
        // fix: 给筛选项赋初值，使得重置功能能够正常工作
        // Object.defineProperty 对不存在的属性无法拦截
        list.filter = {
          ...Object.fromEntries(
            Array.from(
              elFormRefOfListFilter.fields || [],
              v => [v.labelFor, undefined]
            )
          ),
          ...list.filter
        }
      } else {
        getList()
      }
    }
  })

  return toRefs(reactive({
    list,
    getList,
    form,
    openForm,
    submitForm,
    d,
    enable,
    disable,
    updateStatus,
    c: (...args) => {
      form.status = 'c'
      // 复制新增需要传参，常规新增不需要
      return openForm(
        ...(currentInstance.value.createFromCopy__ ? args : [])
      )
    },
    r: (...args) => {
      form.status = 'r'
      return openForm(...args)
    },
    u: (...args) => {
      form.status = 'u'
      return openForm(...args)
    },
    // 单条记录表单的标题
    formTitle: computed(() =>
      currentInstance.value?.createFromCopy__
        ? '复制新增'
        : formTitleHash[form.status]
    ),
    // 重置筛选条件
    reset: () => {
      resetListFilter()
      if (initialListFilter) {
        list.filter = {
          ...list.filter,
          ...initialListFilter(),
        }
      }
    },
    // 查询列表（监听筛选条件时不需要）
    queryList: () => {
      validateListFilter().then(() => {
        list.filter.pageNo = 1
        getList()
      })
    },
    // 监听页码切换（监听筛选条件时不需要）
    onPageNumberChange: () => {
      if (!list.watchFilter) {
        getList()
      }
    },
    // 当前 Vue 实例
    currentInstance,
    // 列表筛选项表单的 ref
    listFilterRef,
    // 详情表单的 ref
    formRef,
    // 校验列表筛选项
    validateListFilter,
    // 重置列表筛选项
    resetListFilter,
    // 清除详情表单校验
    clearValidateOfFormData,
    // 校验详情表单
    validateFormData,
  }))
}
