# Admate / 管理后台伴侣

`Admate` 的目标是以快速简洁的方式开发管理后台页面，

并在此基础上确保灵活可配，避免过度封装。

## Features

- 同时支持Vue2 & Vue3
- 不限制UI框架
- 列表、单条记录的CRUD
- 除了标配的CRUD封装，也为其他请求提供调用捷径（含上传、下载）
- 节流控制筛选列表的接口调用频率（监听筛选参数时）

周全的收尾工作，没有“后顾之忧”：

- 关闭表单对话框时，自动将表单绑定的数据恢复至初始状态（不是直接清空）
- 删除当前分页最后一条记录时，自动切换至上一页（如果当前不在第一页）
- 离开页面时，自动终止尚未完成的请求

<br>

## Installation

### Vue3

![NPM](https://nodei.co/npm/admate.png)

```bash
pnpm add admate vue@3 axios
```

### Vue2

```bash
pnpm add admate vue@2 axios @vue/composition-api
```

### 初始化

```ts
// @/utils/useMyAdmate.ts

import { ref, reactive, toRefs, computed, watch, onMounted, getCurrentInstance } from '@vue/composition-api'
// 替换为你自己的axios封装
// 如import request as axios from '@/utils/request'
import axios from 'axios'
import useAdmate from 'admate'
import { mapKeys, merge } from 'lodash-es'
import { waitFor } from 'kayran'

export default (admateConfig) => {
  // 初始化admate，并给导出的变量添加自定义的命名标识
  const admate = mapKeys(useAdmate(merge({
    // axios或axios实例
    axios,
    // crud接口的axios配置
    axiosConfig: {
      c: {
        url: 'create',
        method: 'POST',
      },
      r: {
        url: 'queryForDetail',
        method: 'POST',
      },
      u: {
        url: 'update',
        method: 'POST',
      },
      d: {
        url: 'delete',
        method: 'POST',
      },
      getList: {
        url: 'queryForPage',
        method: 'POST',
      },
      updateStatus: {
        url: 'updateStatus',
        method: 'POST',
      },
    },
    // 列表相关配置
    list: {
      // 查询列表接口的默认参数
      filter: {
        // 页容量
        // 注意：如果修改了默认值，需要同步修改el-pagination组件pageSize参数的值
        pageSize: 10,
      },
      dataAt: 'data.list',
      totalAt: 'data.total',
      pageNumberKey: 'pageNo',
    },
    // 单条记录相关配置
    row: {
      data: {
        name: 'default',
      },
      dataAt: 'data'
    },
    // getList代理
    getListProxy (getList, caller) {
      if (caller === 'filterChange') {
        listFilterFormRef.value.validate().then(() => {
          getList()
        })
      } else {
        getList()
        if (['c', 'u', 'd', 'updateStatus', 'enable', 'disable'].includes(caller)) {
          currentInstance.value.$Swal.success('操作成功')
        }
      }
    },
    // submit代理
    submitProxy (submit) {
      return new Promise((resolve, reject) => {
        rowDataFormRef.value.$refs.elForm.validate().then(async () => {
          const [res, err] = await waitFor(submit())
          err ? reject() : resolve()
        })
      })
    }
  }, admateConfig)), (v, k) => `${k}__`)

  const listFilterFormRef = ref(null)
  const rowDataFormRef = ref(null)

  // 关闭表单时，重置校验
  watch(() => admate.row__.show, n => {
    if (!n) {
      setTimeout(() => {
        rowDataFormRef.value.$refs.elForm.resetFields()
      }, 150)
    } else {

    }
  })

  // 获取当前Vue实例
  const currentInstance = ref(null)
  onMounted(() => {
    currentInstance.value = getCurrentInstance().proxy
  })

  return toRefs(reactive({
    ...admate,
    // 单条记录表单的标题
    dialogTitle: computed(() => ({
      c: '新增',
      r: '查看',
      u: '编辑',
    }[admate.row__.status])),
    // 重置筛选条件
    reset: () => {
      listFilterFormRef.value.resetFields()
    },
    // 查询列表（监听筛选条件时不需要）
    queryList: () => {
      listFilterFormRef.value.validate().then(() => {
        admate.list__.filter.pageNo = 1
        admate.getList__()
      })
    },
    // 监听页码切换（监听筛选条件时不需要）
    onPageNumberChange: () => {
      if (!admate.list__.watchFilter) {
        admate.getList__()
      }
    },
    // 当前Vue实例
    currentInstance,
    // 列表筛选条件表单的ref
    listFilterFormRef,
    // 单条记录表单的ref
    rowDataFormRef,
  }))
}

```

<br>

### 样式

如果你的系统没有集成 `windicss` / `tailwind`，需要引入下方样式补丁：

```scss
/* @/utils/admate.css */

.p-20px {
  padding: 20px;
}

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.my-20px {
  margin-top: 20px;
  margin-bottom: 20px;
}
```

<br>

### 搭配代码生成器使用

使用代码生成器生成页面模板

#### Installation

安装Chrome/Edge插件 `YApi2Code`，或使用离线版：

:one: <a href="https://github.com/cloydlau/yapi2code-crx/blob/master/yapi2code-crx.zip?raw=true" download>下载离线包</a>后解压

:two: 打开浏览器 `扩展程序`，并开启 `开发者模式`

:three: 点击 `加载已解压的扩展程序`，选择解压后的文件夹

#### Usage

:one: 访问YApi，选中相应模块的 `查询列表` 接口

:two: 点击浏览器右上角运行插件

:three: 点击 `生成代码`，代码将被复制至剪贴板

:four: 创建页面文件 `xxx.vue`，粘贴代码

<br>

### ElementPlus 示例

```vue
<!-- somepage.vue -->

<template>
  <div class="p-20px">
    <el-form
      ref="listFilterFormRef"
      :model="list__.filter"
      inline
    >
      <el-form-item prop="name" required>
        <el-input v-model="list__.filter.name" placeholder="姓名"/>
      </el-form-item>
      <el-form-item>
        <el-button
          v-if="!list__.watchFilter"
          type="primary"
          @click="queryList"
        >
          查询
        </el-button>
        <el-button
          @click="reset"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <div class="flex justify-between my-20px">
      <div>
        <el-button
          type="primary"
          @click="c__"
        >
          新增
        </el-button>
      </div>

      <el-pagination
        v-model:current-page="list__.filter.pageNo"
        v-model:page-size="list__.filter.pageSize"
        :total="list__.total"
        @current-change="onPageNumberChange"
      />
    </div>

    <el-table
      :data="list__.data"
      :loading="list__.loading"
    >
      <el-table-column prop="name" label="姓名"/>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button type="text" @click="r__(row)">查看</el-button>
          <el-button type="text" @click="u__(row)">编辑</el-button>
          <el-button type="text" @click="d__(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      :title="dialogTitle"
      v-model="row__.show"
    >
      <el-form
        ref="rowDataFormRef"
        :model="row__.data"
        :disabled="row__.status==='r'"
      >
        <el-form-item label="姓名" prop="name" required>
          <el-input v-model="row__.data.name"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="row__.show=false">取 消</el-button>
        <el-button
          type="primary"
          @click="submit__"
          :loading="row__.loading"
          v-if="row__.status!=='r'"
        >
          确 定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import useMyAdmate from '../useMyAdmate'
import { API_PREFIX as urlPrefix } from '../../mock/demo/crud'

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
  queryList,
  reset,
  onPageNumberChange,
  currentInstance,
  listFilterFormRef,
  rowDataFormRef,
} = useMyAdmate({
  urlPrefix,
})
</script>

<style lang="scss" scoped>

</style>
```

<br>

### ElementUI 示例

```vue
<!-- somepage.vue -->

<template>
  <div class="p-20px">
    <el-form
      ref="listFilterFormRef"
      :model="list__.filter"
      inline
    >
      <el-form-item prop="name" required>
        <el-input v-model="list__.filter.name" placeholder="姓名"/>
      </el-form-item>
      <el-form-item>
        <el-button
          v-if="!list__.watchFilter"
          type="primary"
          @click="queryList"
        >
          查询
        </el-button>
        <el-button
          @click="reset"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <div class="flex justify-between my-20px">
      <div>
        <el-button
          type="primary"
          @click="c__"
        >
          新增
        </el-button>
      </div>

      <el-pagination
        v-model:current-page="list__.filter.pageNo"
        v-model:page-size="list__.filter.pageSize"
        :total="list__.total"
        @current-change="onPageNumberChange"
      />
    </div>

    <el-table
      :data="list__.data"
      :loading="list__.loading"
    >
      <el-table-column prop="name" label="姓名"/>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button type="text" @click="r__(row)">查看</el-button>
          <el-button type="text" @click="u__(row)">编辑</el-button>
          <el-button type="text" @click="d__(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="row__.show"
    >
      <el-form
        ref="rowDataFormRef"
        :model="row__.data"
        :disabled="row__.status==='r'"
      >
        <el-form-item label="姓名" prop="name" required>
          <el-input v-model="row__.data.name"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="row__.show=false">取 消</el-button>
        <el-button
          type="primary"
          @click="submit__"
          :loading="row__.loading"
          v-if="row__.status!=='r'"
        >
          确 定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import useMyAdmate from '@/utils/useMyAdmate'
import { API_PREFIX as urlPrefix } from '../../mock/demo/crud'

export default {
  setup: () => useMyAdmate({
    urlPrefix,
  }),
}
</script>

<style lang="scss" scoped>

</style>
```

<br>

### AntDesignVue 2.x 示例

```vue
<!-- somepage.vue -->

<template>
  <div class="p-20px">
    <a-form
      ref="listFilterFormRef"
      layout="inline"
      :model="list__.filter"
    >
      <a-form-item name="name" required>
        <a-input v-model:value="list__.filter.name" placeholder="姓名"/>
      </a-form-item>
      <a-button
        v-if="!list__.watchFilter"
        type="primary"
        @click="queryList"
      >
        查询
      </a-button>
      <a-button
        class="ml-10px"
        @click="reset"
      >
        重置
      </a-button>
    </a-form>

    <div class="flex justify-between my-20px">
      <div>
        <a-button
          type="primary"
          @click="c__"
        >
          新增
        </a-button>
      </div>

      <a-pagination
        v-model:current="list__.filter.pageNo"
        v-model:page-size="list__.filter.pageSize"
        :total="list__.total"
        @change="onPageNumberChange"
      />
    </div>

    <a-table
      rowKey="name"
      :columns="[{
        title:'姓名',
        dataIndex:'name',
      }, {
        title: '操作',
        slots: { customRender: 'action' },
      },]"
      :dataSource="list__.data"
      :loading="list__.loading"
    >
      <template #action="{ row }">
        <a-button type="link" @click="r__(row)">查看</a-button>
        <a-button type="link" @click="u__(row)">编辑</a-button>
        <a-button type="link" @click="d__(row)">删除</a-button>
      </template>
    </a-table>

    <a-modal
      v-model:visible="row__.show"
      :title="dialogTitle"
    >
      <a-form
        ref="rowDataFormRef"
        :model="row__.data"
      >
        <a-form-item name="name" required label="姓名">
          <a-input v-model:value="row__.data.name" :disabled="row__.status==='r'"/>
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button key="cancel" @click="row__.show=false">取 消</a-button>
        <a-button
          key="submit"
          type="primary"
          @click="submit__"
          :loading="row__.loading"
          v-if="row__.status!=='r'"
        >
          确 定
        </a-button>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import useMyAdmate from '../useMyAdmate'
import { API_PREFIX as urlPrefix } from '../../mock/demo/crud'

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
  queryList,
  reset,
  onPageNumberChange,
  currentInstance,
  listFilterFormRef,
  rowDataFormRef,
} = useMyAdmate({
  urlPrefix,
})
</script>

<style lang="scss" scoped>

</style>
```

<br>

### AntDesignVue 1.x 示例

<br>

## 列表

### 筛选触发列表更新的方式

- 点击专用的 `查询` 按钮触发（`list.watchFilter === false`）
    - :x: 操作相对繁琐。
    - :x: 列表数据与筛选条件可能是无关的。可能产生“当前的列表数据是否基于筛选项？”的顾虑，导致徒增点击查询按钮的次数。
    - :heavy_check_mark: 想要同时设置多个筛选条件时，只调用一次接口，不会造成资源浪费。

- **改变筛选条件后即时触发（`list.watchFilter === true`，默认）**
    - :heavy_check_mark: 操作相对简便。
    - :heavy_check_mark: 列表数据与筛选条件即时绑定。
    - :heavy_check_mark: ~~想要同时设置多个筛选条件时，接口会被多次调用，造成资源浪费~~（Admate已优化）。

<br>

### 筛选参数

`list.filter`：数据对象

```ts
// 绑定默认值

useAdmate({
  list: {
    filter: {
      pageSize: 15, // 覆盖全局配置
      status: 1 // 新增的
    }
  }
})
```

::: danger  
如果你的参数筛选项中包含 `el-checkbox` 组件，则必须在 data 中声明其初始值，否则将导致无法正确重置（element-ui 的 bug）
:::

```vue
<!-- 示例 -->

<template>
  <el-form ref="listFilterFormRef" :model="list__.filter" inline>
    <el-form-item prop="effect">
      <el-checkbox
        v-model="list__.filter.effect"
        label="生效"
        border
      />
    </el-form-item>
    <el-button @click="reset">重置</el-button>
  </el-form>
</template>

<script>
import useMyAdmate from '@/utils/useMyAdmate'

export default {
  setup: () => useMyAdmate({
    urlPrefix: '',
    list: {
      filter: {
        effect: null
      }
    }
  }),
}
</script>
```

<br>

### 加载状态

`this.list__.loading`

```ts
export default {
  methods: {
    xxx () {
      this.list__.loading = true
      this.$POST('')
      .finally(() => {
        this.list__.loading = false
      })
    }
  }
}
```

<a name="query-table"><br></a>

### Hook: 查询列表时

`getList` ：获取列表，admate内部方法，在首次进入页面、查询列表参数改变、单条记录增删查改后会被调用

`getListProxy`：你可以 `getListProxy` 方法来代理 `getList`

```ts
useAdmate({
  /**
   * @param {Function} getList 被代理的方法
   * @param {string} caller 调用动机 可能的值：'init' 'pageNumberChange' 'filterChange' 'c' 'r' 'u' 'd' 'updateStatus' 'enable' 'disable'
   */
  getListProxy (getList, caller) {
    // 在查询列表之前做点什么...
    this.getList__()
    .then(res => {
      // 在查询列表之后做点什么...
    })
    .catch(res => {})
    .finally()
  },
})
```

<br>

## 表单

### 数据对象

`this.row__.data`

```ts
// 绑定默认值
// 默认值主要用于表单新增时，查看/编辑时，默认值将与接口返回值进行浅混入（Spread Syntax）

export default {
  data () {
    return {
      row__: {
        data: {
          arr: [],
          num: 100
        }
      },
    }
  }
}
```

<br>

### 提交校验

给绑定表单参数的el-form添加校验逻辑即可

```vue
<!-- 示例：额外的校验，自行控制表单的关闭 -->

<template>
  <KiFormDialog :submit="submit"/>
</template>

<script>
export default {
  methods: {
    submit () {
      let valid = false
      if (valid) {
        return this.submit__()
      } else {
        this.$Swal.warning('校验失败')
        return {
          close: false
        }
      }
    }
  }
}
</script>
```

<br>

### 表单形态

`this.row__.status`

可能的值：

- `'c'` 新增
- `'r'` 查看
- `'u'` 编辑
- `''` 关闭

<br>

### 表单标题

dialogTitle

```html

<KiFormDialog :title="row__.status | $dialogTitle"/>
```

默认对应关系：

- c：新增
- r：查看
- u：编辑

修改默认值或补充其他：

```html

<KiFormDialog :title="row__.status | $dialogTitle({ c: '注册' })"/>
```

<br>

### Hook: 打开表单时

```ts
/**
 * 为FormDialog组件retrieve属性定制的方法
 * @returns {Promise<any>}
 */
this.retrieve__
```

```vue
<!-- 示例：修改接口返回值 -->

<template>
  <KiFormDialog :retrieve="retrieve"/>
</template>

<script>
export default {
  methods: {
    retrieve () {
      return this.retrieve__()
      ?.then( // 新增时 retrieve__返回为空 需要判空
        /**
         * @param {object} rowData - 单条记录数据
         */
        rowData => {
          this.row__.data.status = 1
        }
      )
    }
  }
}
</script>
```

```vue
<!-- 在查询单条记录之前做点什么 -->

<template>
  <KiFormDialog :retrieve="retrieve"/>
</template>

<script>
export default {
  methods: {
    retrieve () {
      // retrieve方法在FormDialog打开时会被调用 包括新增时
      // retrieve__帮你排除了新增的情况 但当该方法被你覆写时 需要自行排除
      if ('c' !== this.row__.status) {
        // 在查询单条记录之前做点什么
      }

      return this.retrieve__()
    }
  }
}
</script>
```

<br>

### Hook: 提交表单时

```ts
/**
 * 为FormDialog组件submit属性定制的方法
 * @param {any} 提交前的钩子函数或指定表单参数
 * @returns {Promise<any>} 提交表单接口返回
 */
this.submit__
```

```vue
<!-- 示例：修改提交参数 -->

<template>
  <KiFormDialog :submit="submit"/>
</template>

<script>
export default {
  methods: {
    submit () {
      // 在提交之前做点什么（无论表单校验是否通过）...
      return this.submit__(
        async () => {
          // 在提交之前做点什么（表单校验通过后）...
          if (this.row__.status === 'c') {
            this.row__.data.status = 1
          }

          // 支持在提交之前等待一个异步操作的完成
          // await ... 
        })
      .then(() => {
        // 在提交成功后做点什么...
      })
    }
  }
}
</script>
```

```vue
<!-- 示例：指定提交参数 -->

<template>
  <KiFormDialog :submit="submit"/>
</template>

<script>
export default {
  methods: {
    submit () {
      return this.submit__({
        ...this.row__.data,
        status: 1
      })
    }
  }
}
</script>
```

<br>

## 增删查改

### 查询列表

```ts
/**
 * @param {any} [payload]
 * @param {string} [payloadUse] 指定payload的用途
 * @returns {Promise<any>} 接口返回值
 */
this.getList__
```

<br>

### 查询单条记录

```ts
/**
 * @param {any} [payload]
 * @param {string} [payloadUse] 指定payload的用途
 */
this.r__
```

**参数2的可选值：**

- `'data'`：将payload用作请求配置的 `data` 参数（请求方式为POST/PATCH/PUT/DELETE时默认）
- `'params'`：将payload用作请求配置的 `params` 参数（请求方式为GET/HEAD时默认）
- `'config'`：将payload仅用于构建请求配置（详见[RESTful](#RESTful)）
- `'cache'`：将payload直接用作表单数据（不调用查询单条记录的接口）

<br>

### 新增单条记录

`this.c__`

<br>

### 编辑单条记录

```ts
/**
 * @param {any} [payload]
 * @param {string} [payloadUse] 指定payload的用途
 */
this.u__
```

**参数2的可选值：**

- `'data'`：将payload用作请求配置的 `data` 参数（请求方式为POST/PATCH/PUT/DELETE时默认）
- `'params'`：将payload用作请求配置的 `params` 参数（请求方式为GET/HEAD时默认）
- `'config'`：将payload仅用于构建请求配置（详见[RESTful](#RESTful)）
- `'cache'`：将payload直接用作表单数据（不调用查询单条记录的接口）

<br>

### 删除单条记录

```ts
/**
 * @param {any} [payload]
 * @param {string} [payloadUse] 指定payload的用途
 */
this.d__
```

**参数2的可选值：**

- `'data'`：将payload用作请求配置的 `data` 参数（请求方式为POST/PATCH/PUT/DELETE时默认）
- `'params'`：将payload用作请求配置的 `params` 参数（请求方式为GET/HEAD时默认）
- `'config'`：将payload仅用于构建请求配置（详见[RESTful](#RESTful)）

<br>

### 启用单条记录

```ts
/**
 * @param {any} [payload]
 * @param {string} [payloadUse] 指定payload的用途
 */
this.enable__
```

**参数2的可选值：**

- `'data'`：将payload用作请求配置的 `data` 参数（请求方式为POST/PATCH/PUT/DELETE时默认）
- `'params'`：将payload用作请求配置的 `params` 参数（请求方式为GET/HEAD时默认）
- `'config'`：将payload仅用于构建请求配置（详见[RESTful](#RESTful)）

<br>

### 停用单条记录

```ts
/**
 * @param {any} [payload]
 * @param {string} [payloadUse] 指定payload的用途
 */
this.disable__
```

**参数2的可选值：**

- `'data'`：将payload用作请求配置的 `data` 参数（请求方式为POST/PATCH/PUT/DELETE时默认）
- `'params'`：将payload用作请求配置的 `params` 参数（请求方式为GET/HEAD时默认）
- `'config'`：将payload仅用于构建请求配置（详见[RESTful](#RESTful)）

<br>

### 变更单条记录状态

```ts
/**
 * @param {any} [payload]
 * @param {string} [payloadUse] 指定payload的用途
 */
this.updateStatus__
```

**参数2的可选值：**

- `'data'`：将payload用作请求配置的 `data` 参数（请求方式为POST/PATCH/PUT/DELETE时默认）
- `'params'`：将payload用作请求配置的 `params` 参数（请求方式为GET/HEAD时默认）
- `'config'`：将payload仅用于构建请求配置（详见[RESTful](#RESTful)）

**状态变更的两种方式：**

- 调用同一个接口，传参指定新的状态：使用 `updateStatus`

```html

<el-table-column label="操作" align="center">
  <template slot-scope="{row:{id,status}}">
    <KiPopSwitch
      v-bind="popSwitchProps(status)"
      @change="updateStatus__({id,status:status^1})"
    />
  </template>
</el-table-column>
```

- 启用和停用是独立的两个接口：使用 `enable` 和 `disable`

```html

<el-table-column label="操作" align="center">
  <template slot-scope="{row:{id,status}}">
    <KiPopSwitch
      v-bind="popSwitchProps(status)"
      @change="[enable__,disable__][status]({id})"
    />
  </template>
</el-table-column>
```

<a name="RESTful"><br></a>

## RESTful

如果接口地址需要进行动态拼接

```vue
<!-- 示例 -->

<template>
  <el-table-column label="操作" align="center">
    <template slot-scope="{row}">
      <KiPopButton
        v-if="pageBtnList.includes('查看')"
        icon="el-icon-search"
        @click="r__(row,'config')"
      >
        查看
      </KiPopButton>
      <KiPopButton
        v-if="pageBtnList.includes('编辑')"
        type="primary"
        icon="el-icon-edit"
        @click="u__(row,'config')"
      >
        编辑
      </KiPopButton>
    </template>
  </el-table-column>
</template>

<script>
export default {
  data () {
    return {
      api__: apiGenerator('/somepage', {
        r: config => ({
          url: 'module/' + config.id
        }),
      })
    }
  }
}
</script>
```

<br>

## FormData

axios的data默认以application/json作为MIME type，如果你需要使用 `multipart/form-data`：

- 全局配置

给你的axios配置 `transformRequest`、`headers['Content-Type']`

- 局部配置

`r__`、`u__`、`d__`、`updateStatus__`、`enable__`、`disable__` 的payload参数均支持FormData类型。

```vue
<!-- 示例：局部配置 -->

<template>
  <el-table-column label="操作" align="center">
    <template slot-scope="{row:{id}}">
      <KiPopButton
        v-if="pageBtnList.includes('编辑')"
        type="primary"
        icon="el-icon-edit"
        @click="u__(FormData.from({id}))"
      >
        编辑
      </KiPopButton>
    </template>
  </el-table-column>

  <KiFormDialog
    :show.sync="row__.show"
    :title="row__.status | $dialogTitle"
    v-model="row__.data"
    :retrieve="retrieve__"
    :submit="submit__(FormData.from(row__.data))"
    :readonly="row__.status==='r'"
  >
    <template #el-form>
      <!-- 表单项 -->
    </template>
  </KiFormDialog>
</template>

<script>
import { mixins, apiGenerator } from '@/utils/admate'
import { jsonToFormData, pickDeepBy } from 'kayran'

// 过滤参数并转换为FormData
FormData.from = data => jsonToFormData(pickDeepBy(data, (v, k) =>
  ![NaN, null, undefined].includes(v) &&
  !k.startsWith('__')
))

// 直接转换为FormData
//FormData.from = jsonToFormData

export default {
  mixins: [mixins],
  data () {
    return {
      api__: apiGenerator('xxx'),
      FormData,
    }
  },
  methods: {
    getListProxy__ (motive) {
      this.getList__(FormData.from(this.list__.filter))
      if (['c', 'u', 'd', 'updateStatus', 'enable', 'disable'].includes(motive)) {
        this.$Swal.success('操作成功')
      }
    },
  }
}
</script>
```

<br>

## URL前缀不统一

APIGenerator以统一的URL前缀生成接口调用，当然，也可以不统一：

```ts
// 示例

import { apiGenerator } from '@/utils/admate'

export default {
  data () {
    return {
      api__: apiGenerator('somepage', {
        r: {
          // 如果某个接口的前缀不是'somepage'，可以在URL前面加斜线，即可忽略该前缀。
          url: '/anotherpage/selectOne',
        },
      })
    }
  }
}
```

<br>

## 例：嵌套另一个使用Admate的页面

```vue
<!-- 示例：父页面中某个弹框要展示一个同样使用Admate的页面 -->

<template>
  <div class="p-20px">
    <el-table v-loading="list__.loading" :data="list__.data">
      <!-- -->
      <el-table-column label="操作" align="center">
        <template slot-scope="{row}">
          <KiPopButton
            v-if="pageBtnList.includes('查看子页面')"
            size="mini"
            @click="subpageShow(row)"
          >
            查看子页面
          </KiPopButton>
        </template>
      </el-table-column>

    </el-table>

    <KiFormDialog :show.sync="subpage.show" v-model="subpage.data">
      <subpage v-if="subpage.data.id" :id="subpage.data.id"/>
    </KiFormDialog>
  </div>
</template>

<script>
import { apiGenerator, mixins } from '@/utils/admate'
import subpage from './subpage'

export default {
  mixins: [mixins],
  components: { subpage },
  data () {
    return {
      api__: apiGenerator('somepage'),
      subpage: {
        show: false,
        data: {},
      },
    }
  },
  methods: {
    subpageShow (data) {
      this.subpage.data = {
        ...this.subpage.data,
        ...data,
      }
      this.subpage.show = true
    },
  },
}
</script>
```

```vue
<!-- 子页面 -->

<template>
  <div class="p-20px">
    <el-table v-loading="list__.loading" :data="list__.data">
      <!-- -->
    </el-table>
  </div>
</template>

<script>
import { apiGenerator, mixins } from '@/utils/admate'

export default {
  mixins: [mixins],
  data () {
    return {
      api__: apiGenerator('subpage'),
      list__: {
        filter: {
          id: this.$attrs.id // 用父页面传过来的id作为初始参数
        }
      },
    }
  },
}
</script>

```

<br>

## 例：无列表，直接展示表单的页面

场景：列表中只有一条数据，故列表被省略，默认弹出编辑框

```vue
<!-- 示例 -->

<template>
  <div class="p-20px w-full">
    <KiFormDialog
      :show.sync="row__.show"
      :title="row__.status | $dialogTitle"
      v-model="row__.data"
      :retrieve="retrieve__"
      :submit="submit__"
      ref="formDialog"
      :show-close="false"
      :modal="false"
      class="relative"
    >
      <template #el-form>

      </template>

      <div slot="footer" class="text-right pt-50px">
        <el-button
          type="primary"
          @click="formDialog.confirm"
          :loading="formDialog.submitting"
        >
          保 存
        </el-button>
      </div>
    </KiFormDialog>
  </div>
</template>

<script>
import { mixins, apiGenerator } from '@/utils/admate'

export default {
  mixins: [mixins],
  mounted () {
    this.formDialog = this.$refs.formDialog
  },
  data () {
    return {
      api__: apiGenerator(''),
      formDialog: {},
    }
  },
  methods: {
    getListProxy__ (motive) {
      if (motive === 'init') {
        this.u__()
      } else {
        this.$Swal.success('操作成功').then(() => {
          this.u__()
        })
      }
    }
  }
}
</script>
```

<br>

## 接口调用

### AJAX

```ts
/**
 * 快捷方式
 * @param {string} url 接口地址
 * @param {object} data 接口参数（GET/HEAD请求默认使用params）
 * @param {object} config axios配置
 * @returns {Promise<any>} 接口返回
 */
this.$POST
this.$GET
this.$PATCH
this.$PUT
this.$DELETE
this.$HEAD
```

<br>

### 上传

> MIME type为multipart/form-data

```ts
/**
 * @param {string} url 接口地址
 * @param {object} data 接口参数（GET/HEAD请求默认使用params）
 * @param {object} config axios配置
 * @returns {Promise<any>} 接口返回
 */
this.$POST.upload // 请求方式可以更换
```

<br>

### 下载

**AJAX请求**

```ts
/**
 * @param {string} url 接口地址
 * @param {object} data 接口参数（GET/HEAD请求默认使用params）
 * @param {object} config axios配置
 * @returns {Promise<any>} 接口返回
 */
this.$GET.download // 请求方式可以更换
```

**HTTP请求**

```ts
/**
 * @param {string} url 接口地址
 * @param {object} params 接口参数
 * @param {object} config axios配置
 */
this.$DOWNLOAD
```

<br>

**给上传、下载添加全局回调**

```ts
// 可以在响应拦截器中判断

request.interceptors.response.use(
  response => {
    // download
    if (response.config.responseType === 'blob') {
      console.log('导出成功')
    }
  },
)
```

<br>
