<template>
  <div class="p-20px">
    <el-form
      ref="listFilterFormRef"
      :model="list__.filter"
      inline
      @submit.native.prevent
    >
      <el-form-item prop="name" required>
        <el-input v-model="list__.filter.name" placeholder="姓名"/>
      </el-form-item>
      <el-form-item>
        <el-button
          v-if="list__.watchFilter"
          @click="() => { listFilterFormRef.resetFields() }"
        >
          重置
        </el-button>
        <el-button
          v-else
          type="primary"
          native-type="submit"
          @click="() => {
            listFilterFormRef.validate().then(() => {
              list__.filter.pageNo = 1
              getList__()
            })
          }"
        >
          查询
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
        :current-page.sync="list__.filter.pageNo"
        :page-size.sync="list__.filter.pageSize"
        :total="list__.total"
        @change="() => {
          // 使用【查询】按钮时，记得监听页码的切换
          if (!list__.watchFilter) {
            getList__()
          }
        }"
      />
    </div>

    <el-table
      :loading="list__.loading"
      :data="list__.data"
    >
      <el-table-column prop="name" label="姓名"/>
      <el-table-column label="操作">
        <template slot-scope="{ row }">
          <el-button type="text" @click="r__(row)">查看</el-button>
          <el-button type="text" @click="u__(row)">编辑</el-button>
          <el-button type="text" @click="d__(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="row__.show"
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
import useMyAdmate, { apiGenerator } from './useMyAdmate'
import { ref } from 'vue-demi'
import { API_PREFIX } from '../mock/demo/crud'

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
  currentInstance,
} = useMyAdmate({
  listFilterFormRef,
  rowDataFormRef,
  admateConfig: {
    api: apiGenerator(API_PREFIX),
  }
})
</script>

<style lang="scss" scoped>

</style>
