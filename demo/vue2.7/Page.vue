<script setup>
import useAdmateAdapter from '@/utils/useAdmateAdapter'
import { API_PREFIX as urlPrefix } from '../../mock/crud'

const {
  list,
  listFilterRef,
  form,
  faFormDialogRef,
} = useAdmateAdapter({
  axiosConfig: {
    urlPrefix,
  },
})
</script>

<template>
  <div p-20px>
    <el-form
      ref="listFilterRef"
      :model="list.filter"
      inline
    >
      <el-form-item prop="name">
        <el-input
          v-model="list.filter.name"
          placeholder="姓名"
        />
      </el-form-item>
      <el-form-item prop="status">
        <FaSelect
          v-model="list.filter.status"
          w="180px!"
          placeholder="状态"
          :options="['停用', '启用']"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          v-if="!list.watchFilter"
          type="primary"
          @click="list.search()"
        >
          查询
        </el-button>
        <el-button @click="list.reset()">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <div flex justify-between my-10px>
      <div>
        <el-button
          type="primary"
          @click="form.create()"
        >
          新增
        </el-button>
      </div>

      <el-pagination
        :current-page.sync="list.filter.page.pageNo"
        :page-size.sync="list.filter.page.pageSize"
        :total="list.total"
        @current-change="!list.watchFilter && list.read()"
        @size-change="!list.watchFilter && list.read()"
      />
    </div>

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
            type="text"
            color="[var(--el-button-text-color)]!"
            @click="form.read(row)"
          >
            查看
          </el-button>
          <el-button
            type="text"
            color="[var(--el-color-primary)]!"
            @click="form.update(row)"
          >
            编辑
          </el-button>
          <el-button
            type="text"
            color="[var(--el-color-danger)]!"
            @click="form.delete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <FaFormDialog
      ref="faFormDialogRef"
      v-model="form.data"
      :readonly="form.status === 'read'"
      :show.sync="form.show"
      :title="form.title"
      :retrieving="form.loading"
      :confirm="form.submit"
    >
      <el-form-item
        label="姓名"
        prop="name"
        required
      >
        <el-input v-model="form.data.name" />
      </el-form-item>
    </FaFormDialog>
  </div>
</template>
