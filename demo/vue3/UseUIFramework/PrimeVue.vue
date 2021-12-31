<template>
  <div class="p-20px">
    <el-form
      ref="listFilterRef"
      :model="list.filter"
      inline
    >
      <el-form-item prop="name" required>
        <InputText type="text" v-model="list.filter.name" placeholder="姓名"/>
      </el-form-item>
      <el-form-item prop="status">
        <Dropdown
          v-model="list.filter.status"
          :options="[{
            label: '停用',
            value: 0
          }, {
            label: '启用',
            value: 1
          }]"
          optionLabel="label"
          optionValue="value"
          placeholder="状态"
        />
      </el-form-item>
      <el-form-item>
        <Button
          v-if="!list.watchFilter"
          @click="queryList"
        >
          查询
        </Button>
        <Button
          class="p-button-secondary"
          @click="() => {
            listFilterRef.resetFields()
          }"
        >
          重置
        </Button>
      </el-form-item>
    </el-form>

    <div class="flex justify-between my-10px">
      <div>
        <Button
          @click="c"
        >
          新增
        </Button>
      </div>

      <Paginator
        :rows="list.filter.pageSize"
        :totalRecords="list.total"
        @page="({ page }) => {
          list.filter.pageNo = page + 1
          onPageNumberChange()
        }"
      />
    </div>

    <DataTable :value="list.data" :loading="list.loading">
      <Column field="name" header="姓名"/>
      <Column>
        <template #body="{data}">
          <Button class="p-button-link" @click="r(data)">查看</Button>
          <Button class="p-button-link" @click="u(data)">编辑</Button>
          <Button class="p-button-link" @click="d(data)">删除</Button>
        </template>
      </Column>
    </DataTable>


    <Dialog
      v-model:visible="form.show"
      :style="{width: '450px'}"
      :header="formTitle"
      modal
    >
      <div class="p-field">
        <label for="name">姓名 </label>
        <InputText
          id="name"
          v-model.trim="form.data.name"
          :disabled="form.status==='r'||form.submitting"
          required="true"
          autofocus
          :class="{'p-invalid': form.submitting && !form.data.name}"
        />
        <small class="p-error" v-if="form.submitting && !form.data.name">必填项</small>
      </div>

      <template #footer>
        <Button
          label="取 消"
          class="p-button-secondary"
          @click="form.show=false"
        />
        <Button
          label="确 定"
          @click="() => { submitForm() }"
          :loading="form.submitting"
          v-if="form.status!=='r'&&!form.loading"
        />
      </template>
    </Dialog>


    <!--    <el-dialog
          :title="formTitle"
          v-model="form.show"
        >
          <el-form
            ref="formRef"
            :model="form.data"
            :disabled="form.status==='r'||form.submitting"
            v-loading="form.loading"
          >
            <el-form-item label="姓名" prop="name" required>
              <el-input v-model="form.data.name"/>
            </el-form-item>
          </el-form>
        </el-dialog>-->
  </div>
</template>

<script setup>
import useAdmateAdapter from '../useAdmateAdapter'
import { API_PREFIX as urlPrefix } from '../../../mock/demo/crud'
import { ref } from 'vue'

import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import Paginator from 'primevue/paginator'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'

const listFilterRef = ref(null)
const formRef = ref(null)
const toast = useToast()

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
  admateConfig: { urlPrefix },
  validateListFilter: (...args) => listFilterRef.value.validate(...args),
  validateFormData: (...args) => formRef.value.validate(...args),
  //clearFormDataValidation: (...args) => formRef.value.clearValidate(...args),
  toast: () => {
    // todo: 无效果
    toast.add({
      severity: 'success',
      summary: '操作成功',
    })
  }
})
</script>
