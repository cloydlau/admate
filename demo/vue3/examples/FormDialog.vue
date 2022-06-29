<template>
  <el-dialog :title="formTitle" v-model="form.show">
    <el-form ref="elFormRef" :model="form.data"
      :disabled="form.status === 'r' || form.submitting" v-loading="form.loading">
      <el-form-item label="姓名" prop="name" required>
        <el-input v-model="form.data.name" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="form.show = false">取 消</el-button>
      <el-button type="primary" @click="() => { submitForm() }" :loading="form.submitting"
        v-if="form.status !== 'r' && !form.loading">
        确 定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, } from 'vue'

const elFormRef = ref()

const props = defineProps({
  form: Object,
  formTitle: String,
  submitForm: Function,
})
</script>

<style lang="scss" scoped>
</style>
