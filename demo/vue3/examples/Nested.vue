<script setup>
import useAdmateAdapter from '@/utils/useAdmateAdapter'
import { API_PREFIX as urlPrefix } from '../../../mock/crud'

const { list } = useAdmateAdapter({
  axiosConfig: {
    urlPrefix,
  },
})

const SubPage_listFilterRef = ref()
const SubPage_idKey = 'id'
const SubPage = reactive({
  initialized: false,
  show: false,
  open: (id) => {
    SubPage.show = true
    if (SubPage.initialized) {
      SubPage.list.filter[SubPage_idKey] = id
    }
    else {
      nextTick(() => {
        SubPage.initializeListFilter()
        SubPage.list.filter[SubPage_idKey] = id
        SubPage.initialized = true
      })
    }
  },
  ...useAdmateAdapter({
    axiosConfig: {
      urlPrefix,
    },
    list: {
      filter: {
        [SubPage_idKey]: undefined,
      },
    },
  }, {
    readListImmediately: false,
    getListFilterRef: () => SubPage_listFilterRef.value,
  }),
})
</script>

<template>
  <!-- 示例：某个对话框要展示一个同样使用 Admate 的页面 -->

  <div class="p-20px">
    <el-table
      v-loading="list.loading"
      :data="list.data"
    >
      <el-table-column
        prop="name"
        label="姓名"
      />
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

    <el-dialog
      v-model="SubPage.show"
      title="子页面"
      @closed="SubPage.list.reset()"
    >
      <el-form
        ref="SubPage_listFilterRef"
        :model="SubPage.list.filter"
      >
        <el-form-item :prop="SubPage_idKey" />
      </el-form>
      <div class="p-20px">
        <el-table
          v-loading="SubPage.list.loading"
          :data="SubPage.list.data"
        >
          <el-table-column
            prop="name"
            label="姓名"
          />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>
