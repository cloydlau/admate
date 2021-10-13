// 使用Vue3时，来源替换为 'vue'
// 使用Vue2时，来源替换为 '@vue/composition-api'
import { ref, reactive, toRefs, computed, watch, onMounted, getCurrentInstance } from 'vue-demi'
// 来源替换为 'admate'
import useAdmate from '../src/main'
// 来源替换为 'axios'，或你的axios封装
import request from './utils/request'
import { merge } from 'lodash-es'

export default ({
  admateConfig,
  validateListFilterForm,
  validateRowDataForm = () => {},
  clearValidateOfRowDataForm = () => {},
}) => {
  // 初始化admate
  const admate = useAdmate(merge({
    // axios或axios实例
    axios: request,
    // crud接口的axios配置
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
        // 注意：如果修改了默认值，需要同步修改el-pagination组件pageSize参数的值
        pageSize: 10,
      },
      dataAt: 'data.list',
      totalAt: 'data.total',
      pageNumberKey: 'pageNo',
    },
    // 单条记录相关配置
    row: {
      data: {
        name: 'default',
      },
      dataAt: 'data'
    },
    // getList代理
    getListProxy (getList, caller) {
      if (caller === 'filterChange') {
        validateListFilterForm().then(() => {
          getList()
        })
      } else {
        getList()
        if (['c', 'u', 'd', 'updateStatus', 'enable', 'disable'].includes(caller)) {
          currentInstance.value.$message.success('操作成功')
        }
      }
    },
    // submit代理
    submitProxy (submit) {
      return new Promise((resolve, reject) => {
        validateRowDataForm().then(() => {
          submit().then(() => {
            resolve()
          }).catch(() => {
            reject()
          })
        })
      })
    },
  }, admateConfig))

  // 给暴露的变量加命名标识
  //admate = mapKeys(admate, (v, k) => `${k}__`)

  // 关闭表单时，清除校验
  watch(() => admate.row.show, n => {
    if (!n) {
      setTimeout(() => {
        clearValidateOfRowDataForm()
      }, 150)
    }
  })

  // 获取当前Vue实例
  const currentInstance = ref(null)
  onMounted(() => {
    currentInstance.value = getCurrentInstance().proxy
  })

  // 封装r和u
  const retrieveRowData = rOrU => (...args) => new Promise((resolve, reject) => {
    rOrU(...args).then(() => {
      resolve()
    }).catch(() => {
      // 获取单条记录失败，关闭表单
      admate.row.show = false
      reject()
    }).finally(() => {
      // 回显表单后，清除校验
      clearValidateOfRowDataForm()
    })
  })

  return toRefs(reactive({
    ...admate,
    r: retrieveRowData(admate.r),
    u: retrieveRowData(admate.u),
    // 单条记录表单的标题
    dialogTitle: computed(() => ({
      c: '新增',
      r: '查看',
      u: '编辑',
    }[admate.row.status])),
    // 查询列表（监听筛选条件时不需要）
    queryList: () => {
      validateListFilterForm().then(() => {
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
    // 当前Vue实例
    currentInstance,
  }))
}
