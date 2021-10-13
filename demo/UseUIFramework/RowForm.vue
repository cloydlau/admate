<template>
  <div class="p-20px">
    <h2>{{ dialogTitle }}</h2>
    <el-form
      ref="rowDataFormRef"
      :model="row.data"
      :disabled="row.status==='r'||row.submitting"
      v-loading="row.loading"
    >
      <el-form-item label="姓名" prop="name" required>
        <el-input v-model="row.data.name"/>
      </el-form-item>
    </el-form>
    <el-button @click="row.show=false">取 消</el-button>
    <el-button
      type="primary"
      @click="submit"
      :loading="row.submitting"
      v-if="row.status!=='r'&&!row.loading"
    >
      确 定
    </el-button>
  </div>
</template>

<script setup>
import useMyAdmate from '../useMyAdmate'
import { ref, watch } from 'vue-demi'
import { useRoute, useRouter } from 'vue-router'

const rowDataFormRef = ref(null)
const route = useRoute()
const router = useRouter()

const {
  c,
  r,
  u,
  row,
  submit,
  dialogTitle,
} = useMyAdmate({
  admateConfig: {
    urlPrefix: route.query.urlPrefix,
    getListProxy (getList, caller) {},
    row: JSON.parse(route.query.row),
  },
  validateRowDataForm: (...args) => rowDataFormRef.value.validate(args),
  clearValidateOfRowDataForm: (...args) => rowDataFormRef.value.clearValidate(args),
})

switch (row.value.status) {
  case 'r':
    r.value()
    break
  case 'u':
    u.value()
    break
  case 'c':
    c.value()
    break
}

watch(() => row.value.show, n => {
  if (!n) {
    router.push('/element-plus-without-row-form')
  }
})
</script>

<style lang="scss" scoped>

</style>
