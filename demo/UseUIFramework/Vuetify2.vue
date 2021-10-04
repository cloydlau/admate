<template>
  <div class="p-20px" data-app>
    <v-form
      ref="listFilterFormRef"
    >
      <v-text-field
        v-model="list.filter.name"
        label="姓名"
        :rules="[v => !!v || 'Name is required',]"
        required
        class="w-220px inline-block"
      />
      <v-btn
        class="ml-10px"
        v-if="list.watchFilter"
        color="#2A73C5"
        dark
        @click="queryList"
      >
        查询
      </v-btn>
      <v-btn
        class="ml-10px"
        @click="() => {
          listFilterFormRef.reset()
        }">
        重置
      </v-btn>
    </v-form>

    <div class="flex justify-between my-20px">
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
        :length="Math.ceil(list.total/list.filter.pageSize)"
        @input="onPageNumberChange"
      />
    </div>

    <v-simple-table>
      <template v-slot:default>
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
            <v-btn plain @click="r(item)">查看</v-btn>
            <v-btn plain @click="u(item)">编辑</v-btn>
            <v-btn plain @click="d(item)">删除</v-btn>
          </td>
        </tr>
        </tbody>
      </template>
    </v-simple-table>

    <v-dialog
      v-model="row.show"
    >
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ dialogTitle }}</span>
        </v-card-title>
        <v-card-text>
          <v-form
            ref="rowDataFormRef"
            :disabled="row.status==='r'||row.submitting"
          >
            <v-text-field
              v-model="row.data.name"
              label="姓名*"
              :rules="[v => !!v || 'Name is required',]"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn
            @click="row.show=false"
          >
            取 消
          </v-btn>
          <v-btn
            dark
            color="#2A73C5"
            @click="submit"
            :loading="row.submitting"
            v-if="row.status!=='r'&&!row.loading"
          >
            确 定
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
      validateListFilterForm: (...args) => new Promise((resolve, reject) => {
        listFilterFormRef.value.validate(args) ? resolve() : reject()
      }),
      validateRowDataForm: (...args) => new Promise((resolve, reject) => {
        rowDataFormRef.value.validate(args) ? resolve() : reject()
      }),
      clearValidateOfRowDataForm: (...args) => rowDataFormRef.value.resetValidation(args),
    })

    return {
      ...admate,
      listFilterFormRef,
      rowDataFormRef,
    }
  }
}
</script>
