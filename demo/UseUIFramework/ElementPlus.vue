<template>
  <div class="p-20px">
    <el-form
      ref="listFilterFormRef"
      :model="list__.filter"
      inline
    >
      <el-form-item prop="name" required>
        <el-input v-model="list__.filter.name" placeholder="姓名"/>
      </el-form-item>
      <el-form-item>
        <el-button
          v-if="!list__.watchFilter"
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
          @click="c__"
        >
          新增
        </el-button>
      </div>

      <el-pagination
        v-model:current-page="list__.filter.pageNo"
        v-model:page-size="list__.filter.pageSize"
        :total="list__.total"
        @current-change="onPageNumberChange"
      />
    </div>

    <el-table
      :data="list__.data"
      :loading="list__.loading"
    >
      <el-table-column prop="name" label="姓名"/>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button type="text" @click="r__(row)">查看</el-button>
          <el-button type="text" @click="u__(row)">编辑</el-button>
          <el-button type="text" @click="d__(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      :title="dialogTitle"
      v-model="row__.show"
    >
      <el-form
        ref="rowDataFormRef"
        :model="row__.data"
        :disabled="row__.status==='r'"
      >
        <el-form-item label="姓名" prop="name" required>
          <el-input v-model="row__.data.name"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="row__.show=false">取 消</el-button>
        <el-button
          type="primary"
          @click="submit__"
          :loading="row__.loading"
          v-if="row__.status!=='r'"
        >
          确 定
        </el-button>
      </template>
    </el-dialog>
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
