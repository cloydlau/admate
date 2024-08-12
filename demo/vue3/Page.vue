<script setup>
import { API_PREFIX as urlPrefix } from '../../mock/crud'
import useAdmateAdapter from '@/utils/useAdmateAdapter'

const {
  list,
  listFilterRef,
  queryList,
  form,
  formRef,
  formTitle,
} = useAdmateAdapter({
  axiosConfig: {
    urlPrefix,
  },
}, {
  getElFormRefOfFormData() {
    return formRef.value
  },
})
</script>

<template>
  <div class="p-20px">
    <el-form
      ref="listFilterRef"
      :model="list.filter"
      inline
    >
      <el-form-item
        prop="name"
        required
      >
        <el-input
          v-model="list.filter.name"
          placeholder="姓名"
        />
      </el-form-item>
      <el-form-item prop="status">
        <el-select
          v-model="list.filter.status"
          placeholder="状态"
          w="180px!"
        >
          <el-option
            v-for="(v, i) of ['停用', '启用']"
            :key="i"
            :label="v"
            :value="v"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          v-if="!list.watchFilter"
          type="primary"
          @click="queryList()"
        >
          查询
        </el-button>
        <el-button
          @click="() => {
            listFilterRef.resetFields()
          }"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <div class="flex justify-between my-10px">
      <div>
        <el-button
          type="primary"
          @click="form.create()"
        >
          新增
        </el-button>
      </div>

      <el-pagination
        v-model:current-page="list.filter.page.pageNo"
        v-model:page-size="list.filter.page.pageSize"
        :total="list.total"
        @current-change="list.read()"
        @size-change="list.read()"
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
            text
            @click="form.read(row)"
          >
            查看
          </el-button>
          <el-button
            text
            @click="form.update(row)"
          >
            编辑
          </el-button>
          <el-button
            text
            @click="form.delete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="form.show"
      :title="formTitle"
    >
      <el-form
        ref="formRef"
        v-loading="form.loading"
        :model="form.data"
        :disabled="form.status === 'read' || form.submitting"
      >
        <el-form-item
          label="姓名"
          prop="name"
          required
        >
          <el-input v-model="form.data.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="form.show = false">
          取 消
        </el-button>
        <el-button
          v-if="form.status !== 'read' && !form.loading"
          type="primary"
          :loading="form.submitting"
          @click="form.submit()"
        >
          确 定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
