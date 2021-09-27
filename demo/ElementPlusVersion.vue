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
      ref="tableSort"
      v-loading="list__.loading"
      :data="list__.data"
    >
      <el-table-column
        show-overflow-tooltip
        prop="name"
        label="姓名"
      />
      <el-table-column label="操作">
        <template #default="{row}">
          <el-button type="text" @click="u__(row)">编辑</el-button>
          <el-button type="text" @click="d__(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      :title="formTitle"
      v-model="form__.show"
    >
      <el-form ref="dialogForm" :model="form__.data">
        <el-form-item label="姓名" prop="name">
          <el-input v-model.trim="form__.data.name"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="()=>{form__.show = false}">取 消</el-button>
        <el-button type="primary" @click="submit__">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
//import { getList, doDelete } from '@/api/table'
import { ref, reactive, computed, getCurrentInstance, onMounted } from 'vue-demi'
import axios from 'axios'
import { createAPIGenerator, useAdmate } from '../src/main'
import { API_PREFIX } from '../mock/demo/crud'
import { mapKeys } from 'lodash-es'

const listFilterForm = ref(null)

const {
  list__,
  form__,
  getList__,
  c__,
  r__,
  u__,
  d__,
  updateStatus__,
  retrieve__,
  submit__,
} = mapKeys(useAdmate({
  api: createAPIGenerator(axios)(API_PREFIX),
  list: {
    filter: {
      pageNo: 1,
      pageSize: 20,
      title: '',
    },
    dataAt: 'data.result.items',
    totalAt: 'data.result.total',
    pageNumberParam: 'pageNo',
    filterFormRef: null,
  },
  form: {
    data: {
      name: 'default',
    },
    dataAt: 'data'
  },
  getListProxy (getList, caller, response) {
    console.log(`getListProxy因${caller}被调用，返回值：`, response)
    if (caller === 'filterChange') {
      listFilterForm.value.validate(valid => {
        if (valid) {
          getList()
        }
      })
    } else {
      getList()
    }
  }
}), (v, k) => `${k}__`)

let formTitle = computed(() => ({
  c: '新增',
  r: '查看',
  u: '编辑',
}[form__.status]))

let dialogForm = ref(null)

let currentInstance = ref(null)

//currentInstance.$message.success('操作成功')

/*function showEdit (row) {
  if (!row) {
    form__.status = 'c'
  } else {
    form__.status = 'u'
    form__.data = Object.assign({}, row)
  }
  form__.show = true
}

function close () {
  dialogForm.value.resetFields()
  form__.data = currentInstance.$options.data().form
  form__.show = false
  fetchData()
}

function save () {
  dialogForm.value.validate(async (valid) => {
    if (valid) {
      const { msg } = await api.u(form__.data)
      currentInstance.$message.success('操作成功')
      dialogForm.value.resetFields()
      form__.show = false
      fetchData()
      form__.data = currentInstance.$options.data().form__.data
    } else {
      return false
    }
  })
}*/

onMounted(() => {
  currentInstance = getCurrentInstance()
})
</script>
