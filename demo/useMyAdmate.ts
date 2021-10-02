import { ref, reactive, toRefs, computed, watch, onMounted, getCurrentInstance } from 'vue-demi'
import request from './utils/request'
import useAdmate from '../src/main'
import { mapKeys, merge } from 'lodash-es'
import { waitFor } from 'kayran'

export default (admateConfig) => {
  // 初始化admate，并给导出的变量添加自定义的命名标识
  const admate = mapKeys(useAdmate(merge({
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
        listFilterFormRef.value.validate().then(() => {
          getList()
        })
      } else {
        getList()
        if (['c', 'u', 'd', 'updateStatus', 'enable', 'disable'].includes(caller)) {
          currentInstance.value.$Swal.success('操作成功')
        }
      }
    },
    // submit代理
    submitProxy (submit) {
      return new Promise((resolve, reject) => {
        rowDataFormRef.value.$refs.elForm.validate().then(async () => {
          const [res, err] = await waitFor(submit())
          err ? reject() : resolve()
        })
      })
    },
  }, admateConfig)), (v, k) => `${k}__`)

  const listFilterFormRef = ref(null)
  const rowDataFormRef = ref(null)

  // 关闭表单时，重置校验
  watch(() => admate.row__.show, n => {
    if (!n) {
      setTimeout(() => {
        rowDataFormRef.value.$refs.elForm.resetFields()
      }, 150)
    } else {

    }
  })

  // 获取当前Vue实例
  const currentInstance = ref(null)
  onMounted(() => {
    currentInstance.value = getCurrentInstance().proxy
  })

  return toRefs(reactive({
    ...admate,
    // 单条记录表单的标题
    dialogTitle: computed(() => ({
      c: '新增',
      r: '查看',
      u: '编辑',
    }[admate.row__.status])),
    // 重置筛选条件
    reset: () => {
      listFilterFormRef.value.resetFields()
    },
    // 查询列表（监听筛选条件时不需要）
    queryList: () => {
      listFilterFormRef.value.validate().then(() => {
        admate.list__.filter.pageNo = 1
        admate.getList__()
      })
    },
    // 监听页码切换（监听筛选条件时不需要）
    onPageNumberChange: () => {
      if (!admate.list__.watchFilter) {
        admate.getList__()
      }
    },
    // 当前Vue实例
    currentInstance,
    // 列表筛选条件表单的ref
    listFilterFormRef,
    // 单条记录表单的ref
    rowDataFormRef,
  }))
}
