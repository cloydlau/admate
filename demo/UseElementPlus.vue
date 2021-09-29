<template>
  <div class="p-20px">
    <el-form
      ref="listFilterForm"
      :model="list__.filter"
      inline
      @submit.native.prevent
    >
      <el-form-item prop="title" required>
        <el-input v-model="list__.filter.title" placeholder="姓名"/>
      </el-form-item>
      <el-form-item>
        <el-button
          v-if="list__.watchFilter"
          @click="()=>{listFilterForm.resetFields()}"
        >
          重置
        </el-button>
        <el-button
          v-else
          icon="el-icon-search"
          type="primary"
          native-type="submit"
          @click="()=>{
            list__.filter.pageNo = 1
            getList__()
          }"
        >
          查询
        </el-button>
      </el-form-item>
    </el-form>

    <div class="flex justify-between my-20px">
      <div>
        <el-button
          icon="el-icon-plus"
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
      />
    </div>

    <el-table
      v-loading="list__.loading"
      :data="list__.data"
    >
      <el-table-column prop="name" label="姓名"/>
      <el-table-column label="操作">
        <template #default="{row}">
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
        ref="dialogForm"
        :model="row__.data"
        :disabled="row__.status==='r'"
      >
        <el-form-item label="姓名" prop="name" required>
          <el-input v-model.trim="row__.data.name"/>
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

const listFilterForm = ref(null)
const dialogForm = ref(null)

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
  listFilterForm,
  dialogForm,
  admateConfig: {
    api: apiGenerator(API_PREFIX),
  }
})
</script>
