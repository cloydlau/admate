<template>
  <!-- 子页面 -->

  <div class="p-20px">
    <el-table
      :data="list.data"
      v-loading="list.loading"
    >
      <el-table-column prop="name" label="姓名"/>
    </el-table>
  </div>
</template>

<script>
import useAdmateAdapter from '../../useAdmateAdapter'
import { API_PREFIX as urlPrefix } from '../../../mock/demo/crud'

export default {
  props: ['id'],
  setup: props => useAdmateAdapter({
    admateConfig: {
      urlPrefix,
      list: {
        filter: {
          id: props.id // 用父页面传过来的id作为初始参数
        }
      },
    }
  }),
}
</script>
