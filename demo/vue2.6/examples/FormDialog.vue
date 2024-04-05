<script>
export default {
  props: {
    form: Object,
    formTitle: String,
    submitForm: Function,
  },
}
</script>

<template>
  <KiFormDialog
    ref="kiFormDialogRef"
    v-model="form.data"
    :title="formTitle"
    :show.sync="form.show"
    :submit="submitForm"
    :loading="form.loading"
  >
    <template #el-form>
      <el-form-item
        label=""
        prop=""
        verify
      >
        <el-input
          v-model.trim="form.data.TODO"
          maxlength="30"
          show-word-limit
          clearable
        />
      </el-form-item>
      <el-form-item
        label=""
        prop=""
        verify
      >
        <KiSelect
          v-model="form.data.TODO"
          :options="[
            { label: '', value: '' },
            { label: '', value: '' },
          ]"
          :props="{ label: 'label', value: 'value' }"
        />
      </el-form-item>
    </template>
  </KiFormDialog>
</template>

<style lang="scss" scoped>

</style>
