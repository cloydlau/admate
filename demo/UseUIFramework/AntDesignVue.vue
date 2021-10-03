<template>
  <div class="p-20px">
    <a-form
      ref="listFilterFormRef"
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
        @click="reset"
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
      v-model:visible="row.show"
      :title="dialogTitle"
    >
      <a-form
        ref="rowDataFormRef"
        :model="row.data"
        v-loading="row.loading"
      >
        <a-form-item name="name" required label="姓名">
          <a-input v-model:value="row.data.name" :disabled="row.status==='r'"/>
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button key="cancel" @click="row.show=false">取 消</a-button>
        <a-button
          key="submit"
          type="primary"
          @click="submit"
          :loading="row.submitting"
          v-if="row.status!=='r'&&!row.loading"
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

const {
  list,
  row,
  getList,
  c,
  r,
  u,
  d,
  updateStatus,
  submit,
  dialogTitle,
  queryList,
  reset,
  onPageNumberChange,
  currentInstance,
  listFilterFormRef,
  rowDataFormRef,
} = useMyAdmate({
  urlPrefix,
})
</script>

<style lang="scss" scoped>

</style>
