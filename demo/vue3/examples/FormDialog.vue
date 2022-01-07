<template>
  <el-dialog
    :title="formTitle"
    v-model="form.show"
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
      <el-button @click="form.show=false">取 消</el-button>
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
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const formRef = ref(null)

const props = defineProps({
  form: Object,
  formTitle: String,
  submitForm: Function,
})

const emit = defineEmits(['update:formRef'])

watch(() => props.form.show, n => {
  if (n) {
    nextTick(() => {
      emit('update:formRef', formRef.value)
    })
  }
})
</script>

<style lang="scss" scoped>

</style>
