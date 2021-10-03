<template>
  <div class="p-20px">
    <v-form
      ref="listFilterFormRef"
    >
      <v-text-field
        v-model="list.filter.name"
        label="姓名"
        required
      />
    </v-form>
  </div>
</template>

<script>
import useMyAdmate from '../useMyAdmate'
import { API_PREFIX as urlPrefix } from '../../mock/demo/crud'
import { ref } from 'vue-demi'

export default {
  setup: () => {
    const listFilterFormRef = ref(null)
    const rowDataFormRef = ref(null)

    const admate = useMyAdmate({
      admateConfig: {
        urlPrefix,
      },
      validateListFilterForm: (...args) => listFilterFormRef.value.validate(args),
      validateRowDataForm: (...args) => rowDataFormRef.value.validate(args),
      resetRowDataForm: (...args) => rowDataFormRef.value.reset(args),
    })

    return {
      ...admate,
      listFilterFormRef,
      rowDataFormRef,
    }
  }
}
</script>
