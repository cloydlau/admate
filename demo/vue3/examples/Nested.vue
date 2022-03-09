<template>
  <!-- 示例：父页面中某个对话框要展示一个同样使用Admate的页面 -->

  <div class="p-20px">
    <el-table
      :data="list.data"
      v-loading="list.loading"
    >
      <el-table-column prop="name" label="姓名"/>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button @click="subpageShow(row)">
            查看子页面
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="子页面" v-model="SubPage.show">
      <SubPage v-if="SubPage.data.id" :id="SubPage.data.id"/>
    </el-dialog>
  </div>
</template>

<script>
import useAdmateAdapter from '../useAdmateAdapter'
import { API_PREFIX as urlPrefix } from '.././mock/demo/crud'
import SubPage from './SubPage.vue'

export default {
  setup: () => useAdmateAdapter({
    admateConfig: {
      urlPrefix,
    }
  }),
  components: { SubPage },
  data () {
    return {
      SubPage: {
        show: false,
        data: {},
      },
    }
  },
  methods: {
    subpageShow (data) {
      this.SubPage.data = {
        ...this.SubPage.data,
        ...data,
      }
      this.SubPage.show = true
    },
  },
}
</script>
