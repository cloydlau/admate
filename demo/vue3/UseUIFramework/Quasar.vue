<template>
  <div class="p-20px">
    <q-form ref="listFilterRef">
      <div class="w-220px inline-block">
        <q-input
          v-model="list.filter.name"
          label="姓名"
          lazy-rules
          :rules="[ val => val?.length > 0 || '必填']"
        />
      </div>

      <div class="w-220px inline-block ml-1rem">
        <q-select
          v-model="list.filter.status"
          :options="['停用','启用']"
          label="状态"
        />
      </div>

      <q-btn
        v-if="!list.watchFilter"
        color="primary"
        @click="queryList"
        label="查询"
      />
      <q-btn
        type="reset"
        @click="() => {
          list.filter = {}
        }"
        label="重置"
        class="ml-1rem"
      />
    </q-form>

    <div class="flex justify-between my-10px">
      <div>
        <q-btn
          color="primary"
          @click="c"
          label="新增"
        />
      </div>

      <q-pagination

        @current-change="onPageNumberChange"

        v-model="list.filter.pageNo"
        :max="Math.ceil(list.total/list.filter.pageSize)"
      />
    </div>

    <q-table
      :columns="[{
        label:'姓名',
        field:'name',
      }, {
        label: '操作',
        slots: { customRender: 'action' },
      },]"
      row-key="name"
      :rows="list.data"
      :loading="list.loading"
    >
      <template v-slot:loading>
        <q-inner-loading showing color="primary"/>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="iron" :props="props">
            <q-btn type="text" @click="r(props.row)">查看</q-btn>
            <q-btn type="text" @click="u(props.row)">编辑</q-btn>
            <q-btn type="text" @click="d(props.row)">删除</q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <q-dialog v-model="form.show" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ formTitle }}</div>
        </q-card-section>

        <q-form
          ref="formRef"
          :model="form.data"
          :disabled="form.status==='r'||form.submitting"
          :loading="form.loading"
        >
          <q-input
            v-model="form.data.name"
            label="姓名"
            lazy-rules
            :rules="[ val => val?.length > 0 || '必填']"
          />
        </q-form>

        <q-card-actions align="right">
          <q-btn
            label="取 消"
            v-close-popup
            @click="form.show=false"
          />
          <q-btn
            label="确 定"
            type="submit"
            color="primary"
            @click="() => { submitForm() }"
            :loading="form.submitting"
            v-if="form.status!=='r'&&!form.loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import useMyAdmate from '../../useMyAdmate'
import { API_PREFIX as urlPrefix } from '../../../mock/demo/crud'
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
  clearFormDataValidation: (...args) => formRef.value.resetValidation(...args),
})
</script>
