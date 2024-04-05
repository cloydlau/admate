<script setup>
import { cloneDeep } from 'lodash-es'

import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import Paginator from 'primevue/paginator'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import ProgressSpinner from 'primevue/progressspinner'
import { API_PREFIX as urlPrefix } from '../../../mock/crud'
import useAdmateAdapter from '../../useAdmateAdapter'

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
} = useAdmateAdapter({
  urlPrefix,
}, {
  validateListFilter: (...args) => new Promise((resolve, reject) => {
    if (list.value.filter.name) {
      resolve()
    }
    else {
      reject()
    }
  }),
  validateFormData: (...args) => new Promise((resolve, reject) => {
    if (form.value.data.name) {
      resolve()
    }
    else {
      reject()
    }
  }),
})

const defaultListFilter = cloneDeep(list.value.filter)

const reset = function () {
  list.value.filter = cloneDeep(defaultListFilter)
}
</script>

<template>
  <div class="p-20px">
    <div>
      <InputText
        v-model="list.filter.name"
        placeholder="姓名"
        :class="{ 'p-invalid': !list.filter.name }"
      />
      <small
        v-if="!list.filter.name"
        class="p-error"
      >
        必填项
      </small>
      <Dropdown
        v-model="list.filter.status"
        class="ml-1rem"
        :options="[{
          label: '停用',
          value: 0,
        }, {
          label: '启用',
          value: 1,
        }]"
        optionLabel="label"
        optionValue="value"
        placeholder="状态"
      />
      <Button
        v-if="!list.watchFilter"
        style="margin-left: 1rem;"
        @click="queryList"
      >
        查询
      </Button>
      <Button
        style="margin-left: 1rem;"
        class="p-button-secondary"
        @click="reset"
      >
        重置
      </Button>
    </div>

    <div class="flex justify-between my-10px">
      <div>
        <Button @click="c">新增</Button>
      </div>

      <Paginator
        :rows="list.filter.pageSize"
        :totalRecords="list.total"
        @page="({ page }) => {
          list.filter.pageNo = page + 1
          queryList()
        }"
      />
    </div>

    <DataTable
      :value="list.data"
      :loading="list.loading"
    >
      <Column
        field="name"
        header="姓名"
      />
      <Column header="操作">
        <template #body="{ data }">
          <Button
            class="p-button-link"
            @click="r(data)"
          >
            查看
          </Button>
          <Button
            class="p-button-link"
            @click="u(data)"
          >
            编辑
          </Button>
          <Button
            class="p-button-link"
            @click="d(data)"
          >
            删除
          </Button>
        </template>
      </Column>
    </DataTable>

    <Dialog
      v-model:visible="form.show"
      :header="formTitle"
      modal
    >
      <div
        v-if="form.loading"
        class="flex justify-center w-286.5px"
      >
        <ProgressSpinner />
      </div>
      <div
        v-else
        class="p-field"
      >
        <label for="name">姓名 </label>
        <InputText
          id="name"
          v-model.trim="form.data.name"
          :disabled="form.status === 'r' || form.submitting"
          required="true"
          autofocus
          :class="{ 'p-invalid': !form.data.name }"
        />
        <small
          v-if="!form.data.name"
          class="p-error"
        >
          必填项
        </small>
      </div>

      <template #footer>
        <Button
          label="取 消"
          class="p-button-secondary"
          @click="form.show = false"
        />
        <Button
          v-if="form.status !== 'r' && !form.loading"
          label="确 定"
          :loading="form.submitting"
          @click="() => { submitForm() }"
        />
      </template>
    </Dialog>
  </div>
</template>
