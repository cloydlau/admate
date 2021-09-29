import { ref, reactive, computed, getCurrentInstance, onMounted, watch } from 'vue-demi'
import axios from 'axios'
import { createAPIGenerator, useAdmate } from '../src/main'
import { mapKeys, merge } from 'lodash-es'
import { waitFor } from 'kayran'

export const apiGenerator = createAPIGenerator(axios)

export default ({
  listFilterForm,
  dialogForm,
  admateConfig,
}) => {
  const admate = mapKeys(useAdmate(merge({
    list: {
      dataAt: 'data.result.items',
      totalAt: 'data.result.total',
      pageNumberKey: 'pageNo',
    },
    row: {
      data: {
        name: 'default',
      },
      dataAt: 'data'
    },
    getListProxy (getList, caller, response) {
      //console.log(`getListProxy因${caller}被调用，返回值：`, response)
      if (caller === 'filterChange') {
        listFilterForm.value.validate(valid => {
          if (valid) {
            getList()
            //console.log(`getList被调用`)
          }
        })
      } else {
        getList()
        if (['c', 'u', 'd', 'updateStatus', 'enable', 'disable'].includes(caller)) {
          currentInstance.proxy.$message.success('操作成功')
        }
        //console.log(`getList被调用`)
      }
    },
    submitProxy (submit) {
      return new Promise((resolve, reject) => {
        dialogForm.value.validate(valid => {
          if (valid) {
            setTimeout(async () => {
              const [res, err] = await waitFor(submit())
              err ? reject({
                //loading: true, // reject时默认只停止加载不关闭弹框，可以在这里自定义该行为
              }) : resolve({
                //show: true, // resolve时默认禁止加载并关闭弹框，可以在这里自定义该行为
              })
            }, 1000)
          }
        })
      })
    }
  }, admateConfig)), (v, k) => `${k}__`)

  let dialogTitle = computed(() => ({
    c: '新增',
    r: '查看',
    u: '编辑',
  }[admate.row__.status]))

  // 关闭表单时，重置校验
  watch(() => admate.row__.show, n => {
    if (!n) {
      setTimeout(() => {
        dialogForm.value.resetFields()
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
    currentInstance
  }
}
