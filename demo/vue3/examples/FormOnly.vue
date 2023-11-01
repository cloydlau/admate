<script>
import useAdmateAdapter from '../../useAdmateAdapter'
import { API_PREFIX as urlPrefix } from '../../../mock/crud'

export default {
  setup: () => {
    const {
      u,
      form,
      formRef,
      validateFormData,
      submitForm,
    } = useAdmateAdapter({
      urlPrefix,
      getListProxy(getList, trigger) { },
      submitFormProxy(submitForm) {
        return new Promise((resolve, reject) => {
          validateFormData().then(() => {
            submitForm().then(() => {
              console.log('操作成功')

              resolve({
                show: true,
                submitting: false,
              })

              setTimeout(() => {
                u.value({})
              }, 0)
            }).catch(() => {
              reject()
            })
          })
        })
      },
    }, {
      getElFormRefOfFormData() {
        return formRef.value
      },
    })

    u.value({})

    return {
      form,
      formRef,
      submitForm,
    }
  },
}
</script>

<template>
  <div class="wrapper">
    <el-dialog
      modelValue
      title="编辑"
      :show-close="false"
      :modal="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
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
      <template #footer>
        <el-button
          v-if="form.status !== 'r' && !form.loading"
          type="primary"
          :loading="form.submitting"
          @click="() => { submitForm() }"
        >
          确 定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss">
.wrapper>div {
  position: relative !important;

  &>.el-overlay-dialog {
    position: relative !important;

    &>.el-dialog {
      margin-top: 2px !important;
      margin-bottom: 2px !important;

      &>.el-dialog__header {
        display: none;
      }

      &>.el-dialog__body>div {
        &>div:first-child {
          max-height: calc(100vh - 135px) !important;
        }

        &>[slot='footer']>button:first-child {
          display: none;
        }
      }
    }
  }
}
</style>
