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
import useAdmateAdapter from '../../useAdmateAdapter'
import { API_PREFIX as urlPrefix } from '../../../mock/demo/crud'
import { ref } from 'vue'
import { cloneDeep } from 'lodash-es'

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
    } = useAdmateAdapter({
      admateConfig: {
        urlPrefix,
        form: {
          status: 'u'
        },
        getListProxy (getList, trigger) {
          // 不需要获取列表
        },
        submitFormProxy (submitForm) {
          return new Promise((resolve, reject) => {
            validateFormData().then(() => {
              submitForm().then(() => {
                currentInstance.value.$message.success('操作成功')
                resolve({
                  // 避免触发 admate 内部的表单重置
                  // admate 内部在表单关闭后会重置表单（异步，有150毫秒的延迟）
                  // 延迟的原因：关闭表单可能有动画渐变效果
                  // 如果不延迟：表单还没有完全消失，表单内容就被瞬间清空，体验不好
                  show: true,
                })

                // 手动重置表单（无延迟）
                // 这样才能确保 openForm 在重置之后执行
                Object.assign(form.value, initialForm)

                // 刷新表单
                openForm.value()
              }).catch(() => {
                reject()
              })
            })
          })
        },
      },
      clearFormDataValidation: (...args) => formRef.value.clearValidate(...args),
    })

    const initialForm = cloneDeep(form.value)

    openForm.value()

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
