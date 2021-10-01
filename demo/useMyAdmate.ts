import { ref, computed, getCurrentInstance, onMounted, watch } from '@vue/composition-api'
import axios from 'axios'
import useAdmate from '../src/main'
import { mapKeys, merge } from 'lodash-es'
import { waitFor } from 'kayran'

export default ({
  listFilterFormRef,
  rowDataFormRef,
  admateConfig,
}) => {
  const admate = mapKeys(useAdmate(merge({
    axios,
    axiosConfig: {
      c: {
        url: 'create',
      },
      r: {
        url: 'read',
      },
      u: {
        url: 'update',
      },
      d: {
        url: 'delete',
      },
      getList: {
        url: 'list',
      },
      updateStatus: {
        url: 'updateStatus',
      },
    },
    list: {
      dataAt: 'data.result.items',
      totalAt: 'data.result.total',
      pageNumberKey: 'pageNo',
      //watchFilter: false,
    },
    row: {
      data: {
        name: 'default',
      },
      dataAt: 'data'
    },
    getListProxy (getList, caller) {
      if (caller === 'filterChange') {
        // element-plus支持回调和promise
        // ant-design-vue只支持promise
        listFilterFormRef.value.validate().then(() => {
          getList()
        })
      } else {
        getList()
        if (['c', 'u', 'd', 'updateStatus', 'enable', 'disable'].includes(caller)) {
          currentInstance.proxy.$message.success('操作成功')
        }
      }
    },
    submitProxy (submit) {
      return new Promise((resolve, reject) => {
        rowDataFormRef.value.validate().then(() => {
          setTimeout(async () => {
            const [res, err] = await waitFor(submit())
            err ? reject({
              //loading: true, // reject时默认只停止加载不关闭弹框，可以在这里自定义该行为
            }) : resolve({
              //show: true, // resolve时默认禁止加载并关闭弹框，可以在这里自定义该行为
            })
          }, 500)
        })
      })
    }
  }, admateConfig)), (v, k) => `${k}__`)

  const dialogTitle = computed(() => ({
    c: '新增',
    r: '查看',
    u: '编辑',
  }[admate.row__.status]))

  const queryList = () => {
    listFilterFormRef.value.validate().then(() => {
      admate.list__.filter.pageNo = 1
      admate.getList__()
    })
  }

  const reset = () => {
    listFilterFormRef.value.resetFields()
  }

  const onPageNumberChange = () => {
    // 使用【查询】按钮时，监听页码的切换
    if (!admate.list__.watchFilter) {
      admate.getList__()
    }
  }

  // 关闭表单时，重置校验
  watch(() => admate.row__.show, n => {
    if (!n) {
      setTimeout(() => {
        rowDataFormRef.value.resetFields()
      }, 150)
    }
  })

  let currentInstance = ref(null)
  onMounted(() => {
    currentInstance = getCurrentInstance()
  })

  return {
    ...admate,
    dialogTitle,
    queryList,
    reset,
    onPageNumberChange,
    currentInstance,
  }
}
