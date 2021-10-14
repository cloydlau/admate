<template>
  <div class="p-20px w-full page">
    <el-dialog
      modelValue
      :title="formTitle"
      :show-close="false"
      :modal="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      {{ form.loading }}
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
        <el-button
          type="primary"
          @click="submitForm"
          :loading="form.submitting"
          v-if="form.status!=='r'&&!form.loading"
        >
          确 定
        </el-button>
      </template>
      {{ form.show }}
    </el-dialog>
  </div>
</template>

<script>
import useMyAdmate from '../useMyAdmate'
import { API_PREFIX as urlPrefix } from '../../mock/demo/crud'
import { ref, watch } from 'vue-demi'

export default {
  setup: () => {
    const formRef = ref(null)

    const validateFormData = (...args) => formRef.value.validate(...args)

    const {
      form,
      openForm,
      submitForm,
      formTitle,
      currentInstance,
    } = useMyAdmate({
      admateConfig: {
        urlPrefix,
        form: {
          status: 'u'
        },
        getListProxy (getList, caller) {
          // 什么也不做
        },
        submitFormProxy (submitForm) {
          return new Promise((resolve, reject) => {
            validateFormData().then(() => {
              submitForm().then(() => {
                currentInstance.value.$message.success('操作成功')
                resolve()

              }).catch(() => {
                reject()
              })
            })
          })
        },
      },
      clearFormDataValidation: (...args) => formRef.value.clearValidate(...args),
    })

    openForm.value()

    watch(() => form.value.show, (n, o) => {
      console.log(n)
      if (!n) {
        openForm.value()
      }
    })

    return {
      form,
      openForm,
      submitForm,
      formTitle,
      currentInstance,
      formRef,
    }
  }
}
</script>

<style lang="scss">
.page > div {
  position: relative !important;

  & > .el-overlay-dialog {
    position: relative;
  }
}
</style>
