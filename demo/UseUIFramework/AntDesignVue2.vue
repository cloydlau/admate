<template>
  <div class="p-20px">
    <a-form
      ref="listFilterFormRef"
      layout="inline"
      :model="list__.filter"
    >
      <a-form-item name="name" required>
        <a-input v-model:value="list__.filter.name" placeholder="姓名"/>
      </a-form-item>
      <a-button
        v-if="!list__.watchFilter"
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
          @click="c__"
        >
          新增
        </a-button>
      </div>

      <a-pagination
        v-model:current="list__.filter.pageNo"
        v-model:page-size="list__.filter.pageSize"
        :total="list__.total"
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
      :dataSource="list__.data"
      :loading="list__.loading"
    >
      <template #action="{ row }">
        <a-button type="link" @click="r__(row)">查看</a-button>
        <a-button type="link" @click="u__(row)">编辑</a-button>
        <a-button type="link" @click="d__(row)">删除</a-button>
      </template>
    </a-table>

    <a-modal
      v-model:visible="row__.show"
      :title="dialogTitle"
    >
      <a-form
        ref="rowDataFormRef"
        :model="row__.data"
      >
        <a-form-item name="name" required label="姓名">
          <a-input v-model:value="row__.data.name" :disabled="row__.status==='r'"/>
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button key="cancel" @click="row__.show=false">取 消</a-button>
        <a-button
          key="submit"
          type="primary"
          @click="submit__"
          :loading="row__.loading"
          v-if="row__.status!=='r'"
        >
          确 定
        </a-button>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import useMyAdmate from '../useMyAdmate'
import { ref } from '@vue/composition-api'
import { API_PREFIX as urlPrefix } from '../../mock/demo/crud'

const listFilterFormRef = ref(null)
const rowDataFormRef = ref(null)

const {
  list__,
  row__,
  getList__,
  c__,
  r__,
  u__,
  d__,
  updateStatus__,
  submit__,
  dialogTitle,
  queryList,
  reset,
  onPageNumberChange,
  currentInstance,
} = useMyAdmate({
  listFilterFormRef,
  rowDataFormRef,
  admateConfig: {
    urlPrefix,
  }
})
</script>

<style lang="scss" scoped>

</style>
