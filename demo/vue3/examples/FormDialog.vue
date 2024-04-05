<script setup>
import { ref } from 'vue'

const props = defineProps({
  form: Object,
  formTitle: String,
  submitForm: Function,
})

const elFormRef = ref()
</script>

<template>
  <el-dialog
    v-model="form.show"
    :title="formTitle"
  >
    <el-form
      ref="elFormRef"
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
      <el-button @click="form.show = false">取 消</el-button>
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
</template>

<style lang="scss" scoped>
</style>
