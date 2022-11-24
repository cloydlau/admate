<template>
  <!-- 示例：某个对话框要展示一个同样使用 Admate 的页面 -->

  <div class="p-20px">
    <el-table v-loading="list.loading" :data="list.data">
      <el-table-column prop="name" label="姓名" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button
            @click="SubPage.open(row.id)"
          >
            查看子页面
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="SubPage.show" title="子页面">
      <div class="p-20px">
        <el-table v-loading="SubPage.list.loading" :data="SubPage.list.data">
          <el-table-column prop="name" label="姓名" />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import useAdmateAdapter from '../../useAdmateAdapter'
import { API_PREFIX as urlPrefix } from '../../../mock/demo/crud'

const {
  list,
  getList,
  reset,
  listFilterRef,
  form,
  c,
  r,
  u,
  d,
  updateStatus,
  formTitle,
  submitForm,
  formRef,
  currentInstance,
} = useAdmateAdapter({
  urlPrefix,
})

const elFormRefOfSubPage = ref()
const idKeyOfSubPage = ''
const SubPage = reactive({
  initialized: false,
  show: false,
  open: (id) => {
    SubPage.show = true
    if (!SubPage.initialized) {
      nextTick(() => {
        SubPage.list.filter = reactive({
          ...Object.fromEntries(Array.from(elFormRefOfSubPage.value.fields || [], v => [v.labelFor, undefined])),
          ...SubPage.list.filter,
          [idKeyOfSubPage]: id,
        })
        SubPage.initialized = true
      })
    } else if (SubPage.list.filter[idKeyOfSubPage] === id) {
      SubPage.getList()
    } else {
      SubPage.list.filter[idKeyOfSubPage] = id
    }
  },
  onClosed: () => elFormRefOfSubPage.value.resetFields(),
  ...useAdmateAdapter({
    urlPrefix: '',
    axiosConfig: {
      getList: {
        url: '',
      },
    },
    list: {
      filter: {
        [idKeyOfSubPage]: undefined,
      },
    },
  }, {
    getListInitially: false,
  }),
})
</script>
