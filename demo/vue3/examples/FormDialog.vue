<script setup>
import { ref } from 'vue'

const props = defineProps({
  form: Object,
})

const { form } = props

const elFormRef = ref()
</script>

<template>
  <el-dialog
    v-model="form.show"
    :title="form.title"
  >
    <el-form
      ref="elFormRef"
      v-loading="form.loading"
      :model="form.data"
      :disabled="form.status === 'read' || form.submitting"
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
        v-if="form.status !== 'read' && !form.loading"
        type="primary"
        :loading="form.submitting"
        @click="form.submit()"
      >
        确 定
      </el-button>
    </template>
  </el-dialog>
</template>
