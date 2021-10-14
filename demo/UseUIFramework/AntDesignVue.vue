<template>
  <div class="p-20px">
    <a-form
      ref="listFilterRef"
      layout="inline"
      :model="list.filter"
    >
      <a-form-item name="name" required>
        <a-input v-model:value="list.filter.name" placeholder="姓名"/>
      </a-form-item>
      <a-button
        v-if="!list.watchFilter"
        type="primary"
        @click="queryList"
      >
        查询
      </a-button>
      <a-button
        class="ml-10px"
        @click="() => {
          listFilterRef.resetFields()
        }"
      >
        重置
      </a-button>
    </a-form>

    <div class="flex justify-between my-20px">
      <div>
        <a-button
          type="primary"
          @click="c"
        >
          新增
        </a-button>
      </div>

      <a-pagination
        v-model:current="list.filter.pageNo"
        v-model:page-size="list.filter.pageSize"
        :total="list.total"
        @change="onPageNumberChange"
      />
    </div>

    <a-table
      rowKey="name"
      :columns="[{
        title:'姓名',
        dataIndex:'name',
      }, {
        title: '操作',
        slots: { customRender: 'action' },
      },]"
      :dataSource="list.data"
      :loading="list.loading"
    >
      <template #action="{ row }">
        <a-button type="link" @click="r(row)">查看</a-button>
        <a-button type="link" @click="u(row)">编辑</a-button>
        <a-button type="link" @click="d(row)">删除</a-button>
      </template>
    </a-table>

    <a-modal
      v-model:visible="form.show"
      :title="formTitle"
    >
      <a-form
        ref="formRef"
        :model="form.data"
        v-loading="form.loading"
      >
        <a-form-item name="name" required label="姓名">
          <a-input v-model:value="form.data.name" :disabled="form.status==='r'||form.submitting"/>
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button key="cancel" @click="form.show=false">取 消</a-button>
        <a-button
          key="submit"
          type="primary"
          @click="submitForm"
          :loading="form.submitting"
          v-if="form.status!=='r'&&!form.loading"
        >
          确 定
        </a-button>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import useMyAdmate from '../useMyAdmate'
import { API_PREFIX as urlPrefix } from '../../mock/demo/crud'
import { ref } from 'vue-demi'

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
} = useMyAdmate({
  admateConfig: {
    urlPrefix,
  },
  validateListFilter: (...args) => listFilterRef.value.validate(...args),
  validateFormData: (...args) => formRef.value.validate(...args),
  clearFormDataValidation: (...args) => formRef.value.clearValidate(...args),
})
</script>
