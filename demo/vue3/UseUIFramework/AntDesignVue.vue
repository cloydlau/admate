<script setup>
import useAdmateAdapter from '@/utils/useAdmateAdapter'
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
  listFilterRef,
  formRef,
} = useAdmateAdapter({
  urlPrefix,
}, {
  getElFormRefOfFormData() {
    return formRef.value
  },
})
</script>

<template>
  <div class="p-20px">
    <a-form
      ref="listFilterRef"
      layout="inline"
      :model="list.filter"
    >
      <a-form-item
        name="name"
        required
      >
        <a-input
          v-model:value="list.filter.name"
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
        @click="() => {
          listFilterRef.resetFields()
        }"
      >
        重置
      </a-button>
    </a-form>

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
        v-model:current="list.filter.pageNo"
        v-model:page-size="list.filter.pageSize"
        :total="list.total"
        @change="queryList"
      />
    </div>

    <a-table
      row-key="name"
      :columns="[{
        title: '姓名',
        dataIndex: 'name',
      }, {
        title: '操作',
        slots: { customRender: 'action' },
      }]"
      :data-source="list.data"
      :loading="list.loading"
    >
      <template #action="{ row }">
        <a-button
          type="link"
          @click="r(row)"
        >
          查看
        </a-button>
        <a-button
          type="link"
          @click="u(row)"
        >
          编辑
        </a-button>
        <a-button
          type="link"
          @click="d(row)"
        >
          删除
        </a-button>
      </template>
    </a-table>

    <a-modal
      v-model:visible="form.show"
      :title="formTitle"
    >
      <a-form
        ref="formRef"
        v-loading="form.loading"
        :model="form.data"
      >
        <a-form-item
          name="name"
          required
          label="姓名"
        >
          <a-input
            v-model:value="form.data.name"
            :disabled="form.status === 'r' || form.submitting"
          />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button
          key="cancel"
          @click="form.show = false"
        >
          取 消
        </a-button>
        <a-button
          v-if="form.status !== 'r' && !form.loading"
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
