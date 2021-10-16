<template>
  <div class="p-20px">
    <el-form
      ref="listFilterRef"
      :model="list.filter"
      inline
    >
      <el-form-item prop="name" required>
        <el-input v-model="list.filter.name" placeholder="姓名"/>
      </el-form-item>
      <el-form-item prop="status">
        <el-select v-model="list.filter.status" placeholder="状态">
          <el-option
            v-for="(v,i) of ['停用','启用']"
            :key="i"
            :label="v"
            :value="v"
          />
        </el-select>
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
          @click="() => {
            listFilterRef.resetFields()
          }"
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
      :title="formTitle"
      :visible.sync="form.show"
    >
      <el-form
        ref="formRef"
        :model="form.data"
        :disabled="form.status==='r'||form.submitting"
        v-loading="form.loading"
      >
        <el-form-item label="姓名" prop="name" required>
          <el-input v-model="form.data.name"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="form.show=false">取 消</el-button>
        <el-button
          type="primary"
          @click="() => { submitForm() }"
          :loading="form.submitting"
          v-if="form.status!=='r'&&!form.loading"
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
import { ref, onMounted } from 'vue-demi'

export default {
  setup: () => {
    const listFilterRef = ref(null)
    const formRef = ref(null)

    const validateListFilter = (...args) => listFilterRef.value.validate(...args)

    const admate = useMyAdmate({
      admateConfig: {
        urlPrefix,
      },
      getListProxy (getList, trigger) {
        // onMounted中给筛选项赋初值已经触发调用
        if (trigger === 'init') {
          return
        }

        if (trigger === 'filterChange') {
          validateListFilter().then(() => {
            getList()
          })
        } else {
          getList()
          if (['c', 'u', 'd', 'updateStatus', 'enable', 'disable'].includes(trigger)) {
            admate.currentInstance.value.$message.success('操作成功')
          }
        }
      },
      validateListFilter,
      validateFormData: (...args) => formRef.value.validate(...args),
      clearFormDataValidation: (...args) => formRef.value.clearValidate(...args),
    })

    // fix element-ui bug: 给筛选项赋初值，使得重置功能能够正常工作
    onMounted(() => {
      admate.list.value.filter = {
        ...Object.fromEntries(Array.from(listFilterRef.value.fields || [], v => [v.labelFor, undefined])),
        ...admate.list.value.filter,
      }
    })

    return {
      ...admate,
      listFilterRef,
      formRef,
    }
  }
}
</script>
