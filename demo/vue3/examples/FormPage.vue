<script setup>
import Vue, { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useAdmateAdapter from '@/utils/useAdmateAdapter'

const formRef = ref()
const route = useRoute()
const router = useRouter()

const back = function () {
  router.push('/form-decoupled')
}

const {
  form,
  formTitle,
  validateFormData,
} = useAdmateAdapter({
  axiosConfig: {
    urlPrefix: route.query.urlPrefix,
  },
  list: {
    proxy: {
      read() {
        // 不需要获取列表
      },
    },
  },
  form: {
    ...JSON.parse(route.query.form),
    proxy: {
      submit(submitForm) {
        return new Promise((resolve, reject) => {
          validateFormData().then(() => {
            submitForm().then(() => {
              Vue.prototype.$message.success('操作成功')
              back()
            }).catch(() => {
              // eslint-disable-next-line prefer-promise-reject-errors
              reject()
            })
          })
        })
      },
    },
  },
}, {
  getElFormRefOfFormData() {
    return formRef.value
  },
})

form.value.open()
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
      @click="form.submit()"
    >
      确 定
    </el-button>
  </div>
</template>

<style lang="scss" scoped>
</style>
