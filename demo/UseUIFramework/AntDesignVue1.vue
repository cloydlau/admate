<template>
  <div class="p-20px">
    <a-form-model
      ref="listFilterFormRef"
      layout="inline"
      :model="list.filter"
    >
      <a-form-item prop="name" required>
        <a-input v-model="list.filter.name" placeholder="姓名"/>
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
          // todo: 无效果
          listFilterFormRef.resetFields()
        }"
      >
        重置
      </a-button>
    </a-form-model>

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
        v-model="list.filter.pageNo"
        :page-size.sync="list.filter.pageSize"
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
        scopedSlots: { customRender: 'action' },
      },]"
      :dataSource="list.data"
      :loading="list.loading"
    >
      <template slot="action" slot-scope="text, record">
        <a-button type="link" @click="r(record)">查看</a-button>
        <a-button type="link" @click="u(record)">编辑</a-button>
        <a-button type="link" @click="d(record)">删除</a-button>
      </template>
    </a-table>

    <a-modal
      :visible.sync="row.show"
      :title="dialogTitle"
    >
      <a-form-model
        ref="rowDataFormRef"
        :model="row.data"
      >
        <a-form-item prop="name" required label="姓名">
          <a-input v-model="row.data.name" :disabled="row.status==='r'||row.submitting"/>
        </a-form-item>
      </a-form-model>
      <template #footer>
        <a-button key="cancel" @click="row.show=false">取 消</a-button>
        <a-button
          key="submit"
          type="primary"
          @click="submit"
          :loading="row.submitting"
          v-if="row.status!=='r'"
        >
          确 定
        </a-button>
      </template>
    </a-modal>
  </div>
</template>

<script>
import useMyAdmate from '../useMyAdmate'
import { API_PREFIX as urlPrefix } from '../../mock/demo/crud'
import { ref } from 'vue-demi'

export default {
  setup: () => {
    const listFilterFormRef = ref(null)
    const rowDataFormRef = ref(null)

    const admate = useMyAdmate({
      admateConfig: {
        urlPrefix,
      },
      validateListFilterForm: (...args) => listFilterFormRef.value.validate(args),
      validateRowDataForm: (...args) => rowDataFormRef.value.validate(args),
      clearValidateOfRowDataForm: (...args) => rowDataFormRef.value.clearValidate(args),
    })

    return {
      ...admate,
      listFilterFormRef,
      rowDataFormRef,
    }
  }
}
</script>
