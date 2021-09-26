<template>
  <div class="p-20px">
    <el-form
      ref="form"
      :model="list.filter"
      :inline="true"
      @submit.native.prevent
    >
      <el-form-item>
        <el-input v-model="list.filter.title" placeholder="标题"/>
      </el-form-item>
      <el-form-item>
        <el-button
          icon="el-icon-search"
          type="primary"
          native-type="submit"
          @click="handleQuery"
        >
          查询
        </el-button>
      </el-form-item>
    </el-form>

    <div class="flex justify-between my-20px">
      <div>
        <el-button icon="el-icon-plus" type="primary" @click="handleAdd">
          新增
        </el-button>
        <el-button icon="el-icon-delete" type="danger" @click="handleDelete">
          删除
        </el-button>
      </div>

      <el-pagination
        :current-page="list.filter.pageNo"
        :page-size="list.filter.pageSize"
        :total="list.total"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </div>

    <el-table
      ref="tableSort"
      v-loading="list.loading"
      :data="list.data"
      :element-loading-text="elementLoadingText"
      @selection-change="setSelectRows"
    >
      <el-table-column
        show-overflow-tooltip
        type="selection"
        width="55"
      />
      <el-table-column show-overflow-tooltip label="序号" width="95">
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column
        show-overflow-tooltip
        prop="title"
        label="标题"
      />
      <el-table-column show-overflow-tooltip label="操作" width="180px">
        <template #default="{ row }">
          <el-button type="text" @click="handleEdit(row)">编辑</el-button>
          <el-button type="text" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      :title="title"
      :visible.sync="dialogFormVisible"
      @close="close"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model.trim="form.title" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model.trim="form.author" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="close">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
//import { getList, doDelete } from '@/api/table'
import axios from 'axios'

export default {
  components: {},
  filters: {
    statusFilter (status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger',
      }
      return statusMap[status]
    },
  },
  data () {
    return {
      imgShow: true,
      list: {
        filter: {
          pageNo: 1,
          pageSize: 20,
          title: '',
        },
        data: [],
        loading: true,
        total: 0,
      },
      imageList: [],
      selectRows: '',
      elementLoadingText: '正在加载...',
      form: {
        title: '',
        author: '',
      },
      rules: {
        title: [{ required: true, trigger: 'blur', message: '请输入标题' }],
        author: [{ required: true, trigger: 'blur', message: '请输入作者' }],
      },
      title: '',
      dialogFormVisible: false,
    }
  },
  created () {
    this.fetchData()
  },
  beforeDestroy () {},
  mounted () {},
  methods: {
    setSelectRows (val) {
      this.selectRows = val
    },
    handleAdd () {
      this.$refs['edit'].showEdit()
    },
    handleEdit (row) {
      this.$refs['edit'].showEdit(row)
    },
    handleDelete (row) {
      if (row.id) {
        this.$baseConfirm('你确定要删除当前项吗', null, async () => {
          //const { msg } = await doDelete({ ids: row.id })
          const { msg } = {}
          this.$baseMessage(msg, 'success')
          this.fetchData()
        })
      } else {
        if (this.selectRows.length > 0) {
          const ids = this.selectRows.map((item) => item.id).join()
          this.$baseConfirm('你确定要删除选中项吗', null, async () => {
            const { msg } = await doDelete({ ids: ids })
            this.$baseMessage(msg, 'success')
            this.fetchData()
          })
        } else {
          this.$baseMessage('未选中任何行', 'error')
          return false
        }
      }
    },
    handleSizeChange (val) {
      this.list.filter.pageSize = val
      this.fetchData()
    },
    handleCurrentChange (val) {
      this.list.filter.pageNo = val
      this.fetchData()
    },
    handleQuery () {
      this.list.filter.pageNo = 1
      this.fetchData()
    },
    async fetchData () {
      this.list.loading = true
      const { data: { result: { items, total } } } = await axios.get('/basic-api/table/getDemoList')
      this.list.data = items
      const imageList = []
      items.forEach((item, index) => {
        imageList.push(item.img)
      })
      this.imageList = imageList
      this.list.total = total
      setTimeout(() => {
        this.list.loading = false
      }, 500)
    },
    showEdit (row) {
      if (!row) {
        this.title = '添加'
      } else {
        this.title = '编辑'
        this.form = Object.assign({}, row)
      }
      this.dialogFormVisible = true
    },
    close () {
      this.$refs['form'].resetFields()
      this.form = this.$options.data().form
      this.dialogFormVisible = false
      this.$emit('fetch-data')
    },
    save () {
      this.$refs['form'].validate(async (valid) => {
        if (valid) {
          //const { msg } = await doEditZ(this.form)
          const { msg } = {}
          this.$baseMessage(msg, 'success')
          this.$refs['form'].resetFields()
          this.dialogFormVisible = false
          this.$emit('fetch-data')
          this.form = this.$options.data().form
        } else {
          return false
        }
      })
    },
  },
}
</script>
