<script setup>
import { cloneDeep } from 'lodash-es'
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
  listFilterRef,
  formRef,
} = useAdmateAdapter({
  urlPrefix,
}, {
  getElFormRefOfFormData() {
    return formRef.value
  },
})

const defaultListFilter = cloneDeep(list.value.filter)

const reset = function () {
  list.value.filter = cloneDeep(defaultListFilter)
}
</script>

<template>
  <div class="p-20px">
    <a-form-model
      ref="listFilterRef"
      layout="inline"
      :model="list.filter"
    >
      <a-form-item
        prop="name"
        required
      >
        <a-input
          v-model="list.filter.name"
          placeholder="姓名"
        />
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
        @click="reset"
      >
        重置
      </a-button>
    </a-form-model>

    <div class="flex justify-between my-10px">
      <div>
        <a-button
          type="primary"
          @click="c"
        >
          新增
        </a-button>
      </div>

      <a-pagination
        v-model="list.filter.pageNo"
        :page-size.sync="list.filter.pageSize"
        :total="list.total"
        @change="queryList"
      />
    </div>

    <a-table
      rowKey="name"
      :columns="[{
        title: '姓名',
        dataIndex: 'name',
      }, {
        title: '操作',
        scopedSlots: { customRender: 'action' },
      }]"
      :dataSource="list.data"
      :loading="list.loading"
    >
      <template #action="text, record">
        <a-button
          type="link"
          @click="r(record)"
        >
          查看
        </a-button>
        <a-button
          type="link"
          @click="u(record)"
        >
          编辑
        </a-button>
        <a-button
          type="link"
          @click="d(record)"
        >
          删除
        </a-button>
      </template>
    </a-table>

    <a-modal
      :visible.sync="form.show"
      :title="formTitle"
    >
      <a-form-model
        ref="formRef"
        :model="form.data"
      >
        <a-form-item
          prop="name"
          required
          label="姓名"
        >
          <a-input
            v-model="form.data.name"
            :disabled="form.status === 'r' || form.submitting"
          />
        </a-form-item>
      </a-form-model>
      <template #footer>
        <a-button
          key="cancel"
          @click="form.show = false"
        >
          取 消
        </a-button>
        <a-button
          v-if="form.status !== 'r'"
          key="submit"
          type="primary"
          :loading="form.submitting"
          @click="() => { submitForm() }"
        >
          确 定
        </a-button>
      </template>
    </a-modal>
  </div>
</template>
