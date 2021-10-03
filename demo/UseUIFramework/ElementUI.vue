<template>
  <div class="p-20px">
    <el-form
      ref="listFilterFormRef"
      :model="list.filter"
      inline
    >
      <el-form-item prop="name" required>
        <el-input v-model="list.filter.name" placeholder="姓名"/>
      </el-form-item>
      <el-form-item>
        <el-button
          v-if="!list.watchFilter"
          type="primary"
          @click="queryList"
        >
          查询
        </el-button>
        <el-button
          @click="reset"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <div class="flex justify-between my-20px">
      <div>
        <el-button
          type="primary"
          @click="c"
        >
          新增
        </el-button>
      </div>

      <el-pagination
        :current-page.sync="list.filter.pageNo"
        :page-size.sync="list.filter.pageSize"
        :total="list.total"
        @current-change="onPageNumberChange"
      />
    </div>

    <el-table
      :data="list.data"
      :loading="list.loading"
    >
      <el-table-column prop="name" label="姓名"/>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button type="text" @click="r(row)">查看</el-button>
          <el-button type="text" @click="u(row)">编辑</el-button>
          <el-button type="text" @click="d(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="row.show"
    >
      <el-form
        ref="rowDataFormRef"
        :model="row.data"
        :disabled="row.status==='r'||row.submitting"
        v-loading="row.loading"
      >
        <el-form-item label="姓名" prop="name" required>
          <el-input v-model="row.data.name"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="row.show=false">取 消</el-button>
        <el-button
          type="primary"
          @click="submit"
          :loading="row.submitting"
          v-if="row.status!=='r'&&!row.loading"
        >
          确 定
        </el-button>
      </template>
    </el-dialog>
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
