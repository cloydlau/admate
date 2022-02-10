import {
  ref,
  reactive,
  toRefs,
  computed,
  watch,
  onMounted,
  getCurrentInstance
} from 'vue'
import useAdmate from '../../src/main' // 来源替换为 'admate'
import request from './utils/request' // 来源替换为 'axios'，或你的 axios 封装
import { merge } from 'lodash-es'

export default ({
  admateConfig,
  validateListFilter,
  validateFormData = () => {},
  clearFormDataValidation = () => {},
  toast = () => {},
}) => {
  // 初始化 admate
  const admate = useAdmate(merge({
    // axios 或 axios 实例
    axios: request,
    // crud 接口的 axios 配置
    axiosConfig: {
      c: {
        url: 'create',
        method: 'POST',
      },
      r: {
        url: 'queryForDetail',
        method: 'POST',
      },
      u: {
        url: 'update',
        method: 'POST',
      },
      d: {
        url: 'delete',
        method: 'POST',
      },
      getList: {
        url: 'queryForPage',
        method: 'POST',
      },
      updateStatus: {
        url: 'updateStatus',
        method: 'POST',
      },
    },
    // 列表相关配置
    list: {
      // 查询列表接口的默认参数
      filter: {
        // 页容量
        // 注意：如果修改了默认值，需要同步修改 el-pagination 组件 pageSize 参数的值
        pageSize: 10,
      },
      dataAt: 'data.list',
      totalAt: 'data.total',
      pageNumberKey: 'pageNo',
    },
    // 单条记录相关配置
    form: {
      data: {
        name: 'default',
      },
      dataAt: 'data'
    },
    // getList 代理
    getListProxy (getList, trigger) {
      if (trigger === 'filterChange') {
        validateListFilter().then(() => {
          getList()
        })
      } else {
        getList()
        if (['c', 'u', 'd', 'updateStatus', 'enable', 'disable'].includes(trigger)) {
          toast()
        }
      }
    },
    // openForm 代理
    openFormProxy (openForm) {
      function callback () {
        // 回显表单后，清除校验
        clearFormDataValidation()
      }

      const promise = openForm()
      if (promise) {
        return new Promise((resolve, reject) => {
          promise.then(() => {
            resolve()
          }).catch(e => {
            console.error(e)
            reject()
          }).finally(() => {
            callback()
          })
        })
      } else {
        // 新增、复用列表数据时 openForm 没有返回值
        setTimeout(() => {
          callback()
        }, 0)
      }
    },
    // submitForm 代理
    submitFormProxy (submitForm) {
      return new Promise((resolve, reject) => {
        validateFormData().then(() => {
          submitForm().then(() => {
            resolve()
          }).catch(e => {
            console.error(e)
            reject()
          })
        })
      })
    },
  }, admateConfig))

  // 给暴露的变量加命名标识
  //admate = mapKeys(admate, (v, k) => `${k}__`)

  // 关闭表单时，清除校验
  watch(() => admate.form.show, n => {
    if (!n) {
      setTimeout(() => {
        clearFormDataValidation()
      }, 150)
    }
  })

  // 获取当前 Vue 实例
  const currentInstance = ref(null)
  onMounted(() => {
    currentInstance.value = getCurrentInstance().proxy
  })

  return toRefs(reactive({
    ...admate,
    c: () => {
      admate.form.status = 'c'
      admate.openForm()
    },
    r: (...args) => {
      admate.form.status = 'r'
      admate.openForm(...args)
    },
    u: (...args) => {
      admate.form.status = 'u'
      admate.openForm(...args)
    },
    // 单条记录表单的标题
    formTitle: computed(() => ({
      c: '新增',
      r: '查看',
      u: '编辑',
    }[admate.form.status])),
    // 查询列表（监听筛选条件时不需要）
    queryList: () => {
      validateListFilter().then(() => {
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
  }))
}
