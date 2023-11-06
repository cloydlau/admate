<script setup>
import { API_PREFIX as urlPrefix } from '../../../mock/crud'
import useAdmateAdapter from '../../useAdmateAdapter'

const {
  list,
  form,
  getList,
  c,
  r,
  u,
  d,
  updateStatus,
  submitForm,
  formTitle,
  queryList,
  listFilterRef,
  formRef,
} = useAdmateAdapter({
  urlPrefix,
}, {
  validateListFilter: (...args) => new Promise((resolve, reject) => {
    listFilterRef.value.validate(...args) ? resolve() : reject()
  }),
  validateFormData: (...args) => new Promise((resolve, reject) => {
    formRef.value.validate(...args) ? resolve() : reject()
  }),
  clearValidateOfFormData: (...args) => formRef.value.resetValidation(...args),
})
</script>

<template>
  <div
    class="p-20px"
    data-app
  >
    <v-form ref="listFilterRef">
      <v-text-field
        v-model="list.filter.name"
        label="姓名"
        :rules="[v => !!v || 'Name is required']"
        required
        class="w-220px"
        style="display:inline-block !important;"
      />
      <v-btn
        v-if="!list.watchFilter"
        class="ml-10px"
        color="#2A73C5"
        dark
        @click="queryList"
      >
        查询
      </v-btn>
      <v-btn
        class="ml-10px"
        @click="() => {
          listFilterRef.reset()
        }"
      >
        重置
      </v-btn>
    </v-form>

    <div class="flex justify-between my-10px">
      <div>
        <v-btn
          dark
          color="#2A73C5"
          @click="c"
        >
          新增
        </v-btn>
      </div>

      <v-pagination
        v-model="list.filter.pageNo"
        :length="Math.ceil(list.total / list.filter.pageSize)"
        @input="queryList"
      />
    </div>

    <v-simple-table>
      <template #default>
        <thead>
          <tr>
            <th>
              Name
            </th>
            <th>
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in list.data"
            :key="item.name"
          >
            <td>{{ item.name }}</td>
            <td>
              <v-btn
                plain
                @click="r(item)"
              >
                查看
              </v-btn>
              <v-btn
                plain
                @click="u(item)"
              >
                编辑
              </v-btn>
              <v-btn
                plain
                @click="d(item)"
              >
                删除
              </v-btn>
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>

    <v-dialog v-model="form.show">
      <v-card>
        <v-card-title>
          <h5>{{ formTitle }}</h5>
        </v-card-title>
        <v-card-text>
          <v-form
            ref="formRef"
            :disabled="form.status === 'r' || form.submitting"
          >
            <v-text-field
              v-model="form.data.name"
              label="姓名*"
              :rules="[v => !!v || 'Name is required']"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="form.show = false">
            取 消
          </v-btn>
          <v-btn
            v-if="form.status !== 'r' && !form.loading"
            dark
            color="#2A73C5"
            :loading="form.submitting"
            @click="() => { submitForm() }"
          >
            确 定
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
