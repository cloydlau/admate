<script setup>
import { cloneDeep } from 'lodash-es'
import useAdmateAdapter from '../../useAdmateAdapter'
import { API_PREFIX as urlPrefix } from '../../../mock/crud'

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
    listFilterRef.value.validate(...args).then((valid) => {
      valid ? resolve() : reject()
    })
  }),
  validateFormData: (...args) => new Promise((resolve, reject) => {
    formRef.value.validate(...args).then((valid) => {
      valid ? resolve() : reject()
    })
  }),
  clearValidateOfFormData: (...args) => formRef.value.resetValidation(...args),
})

const defaultListFilter = cloneDeep(list.value.filter)

const reset = function () {
  list.value.filter = cloneDeep(defaultListFilter)
}
</script>

<template>
  <div class="p-20px">
    <q-form ref="listFilterRef">
      <div class="w-220px inline-block">
        <q-input
          v-model="list.filter.name"
          label="姓名"
          lazy-rules
          :rules="[val => val?.length > 0 || '必填']"
        />
      </div>

      <div class="w-220px inline-block ml-1rem">
        <q-select
          v-model="list.filter.status"
          :options="['停用', '启用']"
          label="状态"
        />
      </div>

      <q-btn
        v-if="!list.watchFilter"
        color="primary"
        label="查询"
        class="ml-1rem"
        @click="queryList"
      />
      <q-btn
        type="reset"
        label="重置"
        class="ml-1rem"
        @click="reset"
      />
    </q-form>

    <div class="flex justify-between my-10px">
      <div>
        <q-btn
          color="primary"
          label="新增"
          @click="c"
        />
      </div>

      <q-pagination
        v-model="list.filter.pageNo"
        :max="Math.ceil(list.total / list.filter.pageSize)"
      />
    </div>

    <q-table
      :columns="[{
        name: 'name',
        label: '姓名',
        field: 'name',
        align: 'center',
      }, {
        name: 'operation',
        label: '操作',
        field: 'operation',
        slots: { customRender: 'action' },
        align: 'center',
      }]"
      row-key="name"
      :rows="list.data"
      :loading="list.loading"
      hide-pagination
    >
      <template #loading>
        <q-inner-loading showing />
      </template>

      <template #body-cell-operation="props">
        <q-td :props="props">
          <q-btn
            flat
            size="sm"
            @click="r(props.row)"
          >
            查看
          </q-btn>
          <q-btn
            flat
            size="sm"
            color="primary"
            @click="u(props.row)"
          >
            编辑
          </q-btn>
          <q-btn
            flat
            size="sm"
            color="negative"
            @click="d(props.row)"
          >
            删除
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="form.show">
      <q-card>
        <q-card-section>
          <h5>{{ formTitle }}</h5>
        </q-card-section>

        <q-form
          ref="formRef"
          class="w-400px px-50px"
        >
          <q-inner-loading :showing="form.loading" />
          <q-input
            v-model="form.data.name"
            label="姓名"
            :readonly="form.status === 'r' || form.submitting"
            lazy-rules
            :rules="[val => val?.length > 0 || '必填']"
          />
        </q-form>

        <q-card-actions align="right">
          <q-btn
            v-close-popup
            label="取 消"
            @click="form.show = false"
          />
          <q-btn
            v-if="form.status !== 'r' && !form.loading"
            label="确 定"
            type="submit"
            color="primary"
            :loading="form.submitting"
            @click="() => { submitForm() }"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
