<script setup>
import { API_PREFIX as urlPrefix } from '../../../mock/crud'
import FormDialog from './FormDialog.vue'

const {
  list,
  form,
  getList,
  c,
  r,
  u,
  d,
  updateStatus,
  submitForm,
  formTitle,
  queryList,
  listFilterRef,
  formRef,
} = useAdmateAdapter({
  urlPrefix,
  getListProxy() { },
}, {
  getElFormRefOfFormData() {
    return formRef.value.$refs.kiFormDialogRef.$refs.elForm
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
          @click="queryList"
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
          @click="c"
        >
          新增
        </el-button>
      </div>

      <el-pagination
        :current-page.sync="list.filter.pageNo"
        :page-size.sync="list.filter.pageSize"
        :total="list.total"
        @current-change="queryList"
        @size-change="queryList"
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
            @click="r(row)"
          >
            查看
          </el-button>
          <el-button
            type="text"
            @click="u(row)"
          >
            编辑
          </el-button>
          <el-button
            type="text"
            @click="d(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <FormDialog
      ref="formRef"
      :form.sync="form"
      :formTitle="formTitle"
      :submitForm="submitForm"
    />
  </div>
</template>
