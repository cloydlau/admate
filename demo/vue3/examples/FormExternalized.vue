<template>
  <div class="p-20px">
    <el-form
      ref="listFilterRef"
      :model="list.filter"
      inline
    >
      <el-form-item prop="name" required>
        <el-input v-model="list.filter.name" placeholder="姓名"/>
      </el-form-item>
      <el-form-item prop="status">
        <el-select v-model="list.filter.status" placeholder="状态">
          <el-option
            v-for="(v,i) of ['停用','启用']"
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
        v-model:current-page="list.filter.pageNo"
        v-model:page-size="list.filter.pageSize"
        :total="list.total"
        @current-change="onPageNumberChange"
      />
    </div>

    <el-table
      :data="list.data"
      v-loading="list.loading"
    >
      <el-table-column prop="name" label="姓名"/>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button type="text" @click="r(row)">查看</el-button>
          <el-button type="text" @click="u(row)">编辑</el-button>
          <el-button type="text" @click="d(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <FormDialog
      v-model:form="form"
      :formTitle="formTitle"
      :submitForm="submitForm"
      @update:formRef="e => { formRef = e }"
    />
  </div>
</template>

<script setup>
import useAdmateAdapter from '../useAdmateAdapter'
import { API_PREFIX as urlPrefix } from '../../../mock/demo/crud'
import { ref } from 'vue'
import FormDialog from './FormDialog.vue'

const listFilterRef = ref(null)
const formRef = ref(null)

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
  onPageNumberChange,
  currentInstance,
} = useAdmateAdapter({
  admateConfig: {
    urlPrefix,
  },
  validateListFilter: (...args) => listFilterRef.value.validate(...args),
  validateFormData: (...args) => formRef.value.validate(...args),
  clearFormDataValidation: (...args) => formRef.value.clearValidate(...args),
})
</script>
