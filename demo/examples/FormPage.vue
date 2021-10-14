<template>
  <div class="p-20px">
    <h2>{{ formTitle }}</h2>
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
    <el-button @click="back">取 消</el-button>
    <el-button
      type="primary"
      @click="() => { submitForm() }"
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

const formRef = ref(null)
const route = useRoute()
const router = useRouter()

const validateFormData = (...args) => formRef.value.validate(...args)

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
      // 不需要获取列表
    },
    submitFormProxy (submitForm) {
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
  },
  clearFormDataValidation: (...args) => formRef.value?.clearValidate(...args),
})

openForm.value()

const back = function () {
  router.push('/form-decoupled')
}
</script>

<style lang="scss" scoped>

</style>
