<template>

</template>

<script setup>
import useMyAdmate, { apiGenerator } from './useMyAdmate'
import { ref } from 'vue-demi'
import { API_PREFIX } from '../mock/demo/crud'

const listFilterForm = ref(null)
const dialogForm = ref(null)

const {
  list__,
  row__,
  getList__,
  c__,
  r__,
  u__,
  d__,
  updateStatus__,
  submit__,
  dialogTitle,
  currentInstance,
} = useMyAdmate({
  listFilterForm,
  dialogForm,
  admateConfig: {
    api: apiGenerator(API_PREFIX),
  }
})
</script>
