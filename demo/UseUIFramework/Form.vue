<template>
  <div class="p-20px">
    <h2>{{ formTitle }}</h2>
    <el-form
      ref="formDataFormRef"
      :model="form.data"
      :disabled="form.status==='r'||form.submitting"
      v-loading="form.loading"
    >
      <el-form-item label="姓名" prop="name" required>
        <el-input v-model="form.data.name"/>
      </el-form-item>
    </el-form>
    <el-button @click="back">取 消</el-button>
    <el-button
      type="primary"
      @click="submitForm"
      :loading="form.submitting"
      v-if="form.status!=='r'&&!form.loading"
    >
      确 定
    </el-button>
  </div>
</template>

<script setup>
import useMyAdmate from '../useMyAdmate'
import { ref } from 'vue-demi'
import { useRoute, useRouter } from 'vue-router'

const formDataFormRef = ref(null)
const route = useRoute()
const router = useRouter()

const {
  form,
  openForm,
  formTitle,
  submitForm,
  currentInstance,
} = useMyAdmate({
  admateConfig: {
    urlPrefix: route.query.urlPrefix,
    getListProxy (getList, caller) {
      if (['c', 'u', 'd', 'updateStatus', 'enable', 'disable'].includes(caller)) {
        currentInstance.value.$message.success('操作成功')
        back()
      }
    },
    form: JSON.parse(route.query.form),
  },
  validateFormDataForm: (...args) => formDataFormRef.value.validate(...args),
  clearValidateOfFormDataForm: (...args) => formDataFormRef.value?.clearValidate(...args),
})

openForm.value()

const back = function () {
  router.push('/element-plus-without-form')
}
</script>

<style lang="scss" scoped>

</style>
