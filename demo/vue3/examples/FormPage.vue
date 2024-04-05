<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useAdmateAdapter from '../../useAdmateAdapter'

const formRef = ref(null)
const route = useRoute()
const router = useRouter()

const {
  form,
  openForm,
  formTitle,
  submitForm,
  validateFormData,
  currentInstance,
} = useAdmateAdapter({
  urlPrefix: route.query.urlPrefix,
  getListProxy(getList, trigger) {
    // 不需要获取列表
  },
  submitFormProxy(submitForm) {
    return new Promise((resolve, reject) => {
      validateFormData().then(() => {
        submitForm().then(() => {
          currentInstance.value.$message.success('操作成功')
          back()
        }).catch(() => {
          reject()
        })
      })
    })
  },
  form: JSON.parse(route.query.form),
}, {
  getElFormRefOfFormData() {
    return formRef.value
  },
})

openForm.value()

const back = function () {
  router.push('/form-decoupled')
}
</script>

<template>
  <div class="p-20px">
    <h2>{{ formTitle }}</h2>
    <el-form
      ref="formRef"
      v-loading="form.loading"
      :model="form.data"
      :disabled="form.status === 'r' || form.submitting"
    >
      <el-form-item
        label="姓名"
        prop="name"
        required
      >
        <el-input v-model="form.data.name" />
      </el-form-item>
    </el-form>
    <el-button @click="back">取 消</el-button>
    <el-button
      v-if="form.status !== 'r' && !form.loading"
      type="primary"
      :loading="form.submitting"
      @click="() => { submitForm() }"
    >
      确 定
    </el-button>
  </div>
</template>

<style lang="scss" scoped>
</style>
