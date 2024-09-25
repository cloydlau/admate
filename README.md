<h1 align="center">
  <a href="https://npmjs.com/package/admate" target="_blank" rel="noopener noreferrer">
    Admate <sup><img alt="version" src="https://img.shields.io/npm/v/admate.svg?style=flat-square&color=white&label="></sup>
  </a>
</h1>

<p align="center">
  中后台 CRUD 前端元框架，极致简洁的基础上不向灵活性妥协，
  <br>
  致力于攻克「页面重复度高，提取公共代码却难以兼顾定制化需求」的痛点。
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/admate?activeTab=versions"><img alt="created at" src="https://img.shields.io/github/created-at/cloydlau/admate?&color=1C404E&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgNDggNDgiPjxnIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Ik04IDQwaDMyVjI0SDh6Ii8+PHBhdGggc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iNCIgZD0iTTQwIDQwSDhtMzIgMEg0aDRtMzIgMGg0bS00IDBWMjRIOHYxNiIvPjxwYXRoIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjQiIGQ9Im00MCAzNGwtNC0ybC00IDJsLTQtMmwtNCAybC00LTJsLTQgMmwtNC0ybC00IDJtMjQtMTB2LTltLTggOXYtOW0tOCA5di05bTE2LTVWOG0tOCAyVjhtLTggMlY4TTggMjR2MTZtMzItMTZ2MTYiLz48L2c+PC9zdmc+"></a>
  <a href="https://github.com/antfu/eslint-config"><img alt="code style" src="https://antfu.me/badge-code-style.svg"></a>
  <a href="https://app.fossa.io/projects/git%2Bgithub.com%2Fcloydlau%2Fadmate?ref=badge_shield&issueType=license" alt="FOSSA Status"><img src="https://app.fossa.io/api/projects/git%2Bgithub.com%2Fcloydlau%2Fadmate.svg?type=shield&issueType=license"/></a>
  <a href="https://bundlephobia.com/package/admate"><img alt="minzipped size" src="https://img.shields.io/bundlephobia/minzip/admate"></a>
  <a href="https://conventionalcommits.org"><img alt="conventional commits" src="https://img.shields.io/badge/commits-Conventional-FE5196.svg?logo=conventionalcommits"></a>
  <a href="https://semantic-release.gitbook.io"><img alt="semantic release" src="https://img.shields.io/badge/release-semantic-e10079?logo=semantic-release"></a>
  <a href="https://pr.new"><img src="https://developer.stackblitz.com/img/start_pr_dark_small.svg" alt="Start new PR in StackBlitz Codeflow"></a>
</p>

<br>

## 特性

- 🖖 **Vue 2.6/2.7/3 一体通用** - 零成本升级
- 🤸 **跨平台** - 解耦合 UI 框架，极低成本接入任何 Vue 生态中后台模板/框架如 <a href="https://github.com/pure-admin/vue-pure-admin">vue-pure-admin</a>，<a href="https://github.com/vbenjs/vue-vben-admin">vue-vben-admin</a> 或 <a href="https://github.com/yudaocode/yudao-ui-admin-vue3">yudao-ui-admin-vue3</a>
- 🌐 **规整统一的页面代码风格** - 避免各个页面的代码风格五花八门，提升可读性、降低维护成本
- 🥥 **模块级别的请求配置** - 虽然 Axios 支持全局配置，由于同模块内请求配置相似，接口前缀通常是一致的，所以往往还需要模块级别的配置
- 🪝 **量身打造的生命周期** - 代理模式 + 控制反转，定制属于你的生命周期行为
- 🍪 **贴心而不武断的逻辑封装**
  - 列表筛选：支持监听筛选参数 (防抖控制接口调用频率) 的方式，也支持点击读取按钮触发的方式
  - 表单展现风格：支持对话框的风格，也支持独立页面的风格
  - 单条记录状态：支持调用 “编辑接口” 改变状态，也支持调用独立的 “更新状态接口” 指定新状态，也支持分别调用 “启用接口” 和 “停用接口” 改变状态
  - 加载状态：提供列表读取状态、表单读取状态、表单提交状态的响应式变量
- 🧹 **缜密周全的收尾工作，无后顾之忧**
  - 关闭表单时，自动将表单绑定的数据恢复至初始状态 (不是直接清空)
  - 删除当前分页最后一条记录时，自动切换至上一页 (如果当前不在第一页)
- 🔌 **开箱即用的[适配层示例](https://github.com/cloydlau/admate/blob/main/demo/utils/useAdmateAdapter.js)**
  - 列表筛选参数重置 & 参数校验
  - 支持 URL 传参指定筛选项默认值
  - 支持动态生成筛选项默认值，使用场景举例：日期/时间类的参数，如果其默认值为当前最新时刻，重置筛选项时会重置到已过期的时刻

<br>

## 安装

```shell
npm i admate
```

### 外置依赖

- vue
- ~~@vue/composition-api~~：仅 Vue 2.6 或更早版本需要

<br>

## 请求配置

### axios

```ts
useAdmate({
  // Axios 或 Axios 实例
  // 用于调用接口
  axios,
})
```

<br>

### axiosConfig

```ts
useAdmate({
  // Axios 配置
  axiosConfig: {
    // 各接口的 URL 前缀
    urlPrefix: `${import.meta.env.VITE_BASE_URL}/module`,
    // 列表相关接口
    list: {
      // 读取列表
      read: {},
    },
    // 表单相关接口
    form: {
      // 新增
      create: {},
      // 读取
      read: {},
      // 编辑
      update: {},
      // 删除
      delete: {},
      // 切换状态
      switch: {},
    },
  },
})
```

```ts
// 示例: URL 前缀不统一

useAdmate({
  axiosConfig: {
    urlPrefix: 'module1',
    list: {
      read: {
        // 如果某个接口的前缀不是 'somepage'，可以在 URL 前面加斜线，即可忽略该前缀
        url: '/module2/selectOne',
      }
    }
  }
})
```

<br>

### RESTful

如果接口地址需要进行动态拼接

```ts
// 配置
const { list, form } = useAdmate({
  axiosConfig: {
    urlPrefix: `${import.meta.env.VITE_BASE_URL}/module`,
    form: {
      read: ({ id }) => ({
        method: 'GET',
        url: id,
      }),
      update: ({ id }) => ({
        method: 'PUT',
        url: id,
      }),
      delete: ({ id }) => ({
        method: 'DELETE',
        url: id,
      }),
      switch: ({ id }) => ({
        method: 'PUT',
        url: id,
      }),
    },
  }
})

// 使用
form.open({ id: 1 }, 'config')
form.read({ id: 1 }, 'config')
form.update({ id: 1 }, 'config')
form.delete({ id: 1 }, 'config')
form.switch({ id: 1 }, 'config')
```

<br>

### FormData

`Axios` 的 data 默认以 `application/json` 作为 MIME type，如果你需要使用 `multipart/form-data`：

- 全局配置

给你的 `Axios` 配置 `transformRequest`、`headers['Content-Type']`

- 局部配置

`list.read`、`list.search`、`list.reset`、`form.open`、`form.delete`、`form.switch`、`form.submit` 的参数 1 均支持 FormData 类型

```vue
<!-- 示例: 局部配置 -->

<script setup>
import useAdmateAdapter from '@/utils/useAdmateAdapter'

// 过滤 list.value.filter 并转换为 FormData 格式
FormData.from = (json) => {
  const formData = new FormData()
  for (const k in json) {
    if (![Number.NaN, null, undefined].includes(json[k])) {
      formData.append(k, json[k])
    }
  }
  return formData
}

useAdmateAdapter({
  list: {
    proxy: {
      read(readList, trigger) {
        readList(FormData.from(list.value.filter))
      },
    }
  }
})

const FormData = window.FormData
</script>

<template>
  <el-table>
    <el-table-column label="操作">
      <template #default="{ row: { id } }">
        <el-button @click="form.read(FormData.from({ id }))">
          查看
        </el-button>
        <el-button @click="form.update(FormData.from({ id }))">
          编辑
        </el-button>
        <el-button @click="form.delete(FormData.from({ id }))">
          删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>

  <el-dialog>
    <template #footer>
      <el-button @click="() => form.submit(FormData.from(form.data))">
        确 定
      </el-button>
    </template>
  </el-dialog>
</template>
```

<br>

## 列表

### 筛选参数

`list.filter`

```ts
useAdmate({
  list: {
    // 页码的参数名称或路径，必填
    // 支持属性名，如 `'pageNo'`
    // 支持属性路径，如 `'page.pageNo'`
    pageNumberAt: undefined,

    // 可以在这里提供筛选参数的默认值
    filter: {
      'pageNumberAt 生成的页码参数名称': 1
    },
  },
})
```

<br>

### 触发读取

- 点击专用的读取按钮触发
  - ✗ 操作相对繁琐。
  - ✗ 列表数据与筛选条件可能是无关的。可能产生 “当前的列表数据是否基于筛选项？” 的顾虑，导致徒增点击读取按钮的次数。
  - ✓ 想同时设置多个筛选条件时，只调用一次接口，不浪费服务器资源。

```ts
useAdmate({
  list: {
    watchFilter: false,
  }
})
```

<hr>

- **改变筛选条件后即时触发**
  - ✓ 操作相对简便。
  - ✓ 列表数据与筛选条件即时绑定。
  - ✓ ~~想同时设置多个筛选条件时，接口会被多次调用，浪费服务器资源~~ (Admate 已优化)。

```ts
useAdmate({
  list: {
    watchFilter: true, // 默认值

    // 防抖间隔，单位毫秒
    // 如果筛选参数不含 input 类型，可以设置为 0，即不防抖
    // 翻页不会触发防抖
    // watchFilter 开启时有效
    debounce: 300, // 默认值
  }
})
```

<br>

### 列表数据

`list.data`

```ts
useAdmate({
  list: {
    // 列表数据
    data: [],

    // 指定接口返回值中列表数据的位置
    // 支持属性名，如 `'data'`
    // 支持属性路径，如 `'data[0].records'`
    // 支持 symbol 类型的属性名
    // 支持 Function，如 `response => response.data`
    dataAt: undefined,

    // 指定接口返回值中记录总数的位置
    // 支持属性名，如 `'total'`
    // 支持属性路径，如 `'data[0].total'`
    // 支持 symbol 类型的属性名
    // 支持 Function，如 `response => response.total`
    totalAt: undefined,
  }
})
```

<br>

### 读取列表

#### list.read

读取列表，在首次进入页面、列表筛选参数改变、单条记录增删查改后会被调用

```ts
const { list } = useAdmate()

/**
 * PS: 以下为原始函数签名，如果你配置了 list.proxy.read ，则以 list.proxy.read 为准
 *
 * @param {any} [payload = list.filter]
 * @param {'data'|'params'|'config'} [payloadAs] 指定 payload 的用途
 * @returns {Promise<any>} 接口返回值
 */
list.read() // 手动读取
```

#### list.search

重置页码后执行 `list.read` ，用于筛选条件改变后检索列表

```ts
const { list } = useAdmate()

/**
 * PS: 以下为原始函数签名，如果你配置了 list.proxy.read ，则以 list.proxy.read 为准
 *
 * @param {any} [payload = list.filter]
 * @param {'data'|'params'|'config'} [payloadAs] 指定 payload 的用途
 * @returns {Promise<any>} 接口返回值
 */
list.search() // 手动检索
```

#### list.reset

重置筛选条件后执行 `list.read`

```ts
const { list } = useAdmate()

/**
 * PS: 以下为原始函数签名，如果你配置了 list.proxy.reset ，则以 list.proxy.reset 为准
 *
 * @param {any} [payload = list.filter]
 * @param {'data'|'params'|'config'} [payloadAs] 指定 payload 的用途
 * @returns {Promise<any>} 接口返回值
 */
list.reset() // 手动重置
```

#### list.proxy.read

你可以使用 `list.proxy.read` 来代理 `list.read`，以便在 `list.read` 前后执行一些操作，或改变 `list.read` 的行为

```ts
useAdmate({
  list: {
    proxy: {
      /**
       * @param {Function} readList 被代理的原始 readList
       * @param {string} trigger 调用动机 可能的值: 'immediate' 'pageNumberChange' 'filterChange' 'create' 'read' 'update' 'delete' 'switch'
       */
      read(readList, trigger) {},
    },
  },
})
```

```ts
// 示例: 读取列表之前，校验参数

useAdmate({
  list: {
    proxy: {
      read(readList, trigger) {
        if (trigger === 'filterChange') {
          listFilterRef.value.validate().then(() => {
            readList()
          })
        }
        else {
          readList()
        }
      },
    }
  }
})
```

```ts
// 示例: 单条记录操作成功后，弹出提示

useAdmate({
  list: {
    proxy: {
      read(readList, trigger) {
        readList()
        if (['create', 'upadte', 'delete', 'switch'].includes(trigger)) {
          currentInstance.value.$message.success('操作成功')
        }
      },
    }
  }
})
```

```ts
// 示例: 读取列表后，修改列表数据

const { list } = useAdmate({
  list: {
    proxy: {
      read(readList, trigger) {
        readList().then((response) => {
          // response 为 axiosConfig.list.read 的接口返回值
          list.data = response.data?.filter(v => !v.disabled)
        })
      },
    }
  }
})
```

#### list.proxy.reset

你可以使用 `list.proxy.reset` 来代理 `list.reset`，以便在 `list.reset` 前后执行一些操作，或改变 `list.reset` 的行为

```ts
useAdmate({
  list: {
    proxy: {
      /**
       * @param {Function} resetList 被代理的原始 resetList
       */
      reset(resetList) {},
    },
  },
})
```

```ts
// 示例: 使用 UI 组件库的表单重置函数来重置筛选条件

useAdmate({
  list: {
    proxy: {
      reset(resetList) {
        listFilterElFormRef.value.resetFields()
        // 如果分页组件不归属于表单，则表单重置时页码不会被重置，需调用 list.search
        if (!list.watchFilter) {
          list.search()
        }
      },
    }
  }
})
```

<br>

### 读取状态

`list.loading`

`axiosConfig.list.read` 被调用时值为 `true`，否则为 `false`

```vue
<!-- 示例 -->

<script setup>
import useAdmate from 'admate'
import { getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance()
const { list } = useAdmate()

function handleTable() {
  list.value.loading = true
  proxy.$POST('').finally(() => {
    list.value.loading = false
  })
}
</script>

<template>
  <el-table v-loading="list.loading" />
</template>
```

<br>

<a name="form.open-create"></a>

## 表单

### 表单风格

表单默认是对话框/抽屉的风格，但也支持[独立页面](#FormDecoupled)的风格

对比

- 对话框/抽屉：体验好，割裂感低，表单的开闭不影响父页面状态
- 独立页面：体验较差，从表单返回父页面时，父页面的状态会丢失，比如列表筛选状态

<br>

### 表单显隐

`form.show: boolean`

<br>

### 表单数据

`form.data`

```ts
useAdmate({
  form: {
    // 可以在这里提供表单数据的默认值
    data: {},

    // 在查看、编辑表单时，可能需要调用接口（axiosConfig.form.read）回显表单的数据
    // dataAt 用于指定接口返回值中表单数据的位置
    // 支持属性名，如 `'detail'`
    // 支持属性路径，如 `'data[0].detail'`
    // 支持 symbol 类型的属性名
    // 支持 Function，如 `response => response.detail`
    dataAt: undefined,

    // 接口（axiosConfig.form.read）返回值与 form.data 合并的方式
    mergeData: 'deep',
  },
})
```

**mergeData：**

- `'deep'`：深合并 (默认)
- `'shallow'`：浅合并
- `(newFormData: any) => any`：自定义合并方式
- `false`：不合并，直接替换

**为什么默认是深合并？**

在 Vue 2 中，template 不支持 `?.` 语法，要在 template 中判空，代码写起来会非常冗余，通常的做法是在 data 中声明空对象

比如给 form.data 提供默认值：

```vue
<script setup>
import useAdmate from 'admate'

const { form } = useAdmate({
  form: {
    data: {
      a: {
        b: {}
      }
    }
  }
})
</script>

<template>
  {{ form.data.a.b.c }}
</template>
```

如果 axiosConfig.form.read 的返回值为：
`{ a: {} }`

如果与默认值<span style="color:red">浅合并</span>后将得到：
`{ a: {} }` —— 默认值中的对象 b 丢失了，引发空指针异常。

如果与默认值<span style="color:red">深合并</span>后将得到：
`{ a: { b: {} } }` —— 代码正常工作。

```ts
// 示例: 自定义合并方式

import { mergeWith } from 'lodash'

function defaultFormData() {
  return {
    a: {
      b: {}
    }
  }
}

const { form } = useAdmate({
  form: {
    data: defaultFormData(),
    // 接口返回值中嵌套的对象可能为 null，会覆盖默认值中的空对象
    mergeData(
      // 接口返回值在通过 form.dataAt 计算过后的值
      newFormData
    ) {
      // Vue 3 中不需要赋值，mergeWith 的改动是响应式的
      form.data = mergeWith(
        defaultFormData(),
        newFormData,
        (oldObj, newObj) => [undefined, null].includes(newObj) ? oldObj : undefined
      )
    },
  },
})
```

<br>

### 表单形态

`form.status: 'create' | 'read' | 'update'`

<br>

### 表单标题

`form.title: string`

```ts
// 示例: 根据表态形态生成对应的标题

import { computed } from 'vue'

const { form } = useAdmate({
  form: {
    title: computed(() => ({ create: '新增', read: '查看', update: '编辑' }[form.status])),
  },
})
```

<br>

### 新增

打开表单，提交时会调用 `axiosConfig.form.create`

```ts
const { form } = useAdmate()

form.create()

// 等价于：将表单形态设置为“新增”，然后打开表单
form.status = 'create'
form.open()
```

<br>

### 复制新增

> 表单的初始数据不是空白，而是复制一条已有的记录

1. 打开表单时，和查看/编辑一样，需要调接口回显
2. 提交表单时调用的是新增的接口

```ts
const { form } = useAdmate()

form.create(row)

// 等价于：将表单形态设置为“新增”，然后打开表单并传参
form.status = 'create'
form.open(row)
```

<br>

<a name="form.open-read"></a>

### 查看

打开表单，并调用 `axiosConfig.form.read` 回显表单内容

```ts
const { form } = useAdmate()

form.read()

// 等价于：将表单形态设置为“查看”，然后打开表单
form.status = 'read'
/**
 * PS: 以下为原始 openForm 的函数签名，如果你配置了 form.proxy.open ，则以 form.proxy.open 为准
 *
 * @param {any} [payload] 如果 payload 不为空，则会调用 axiosConfig.form.read
 * @param {'data'|'params'|'config'|'cache'} [payloadAs] 指定 payload 的用途
 *   'data': 将 payload 用作请求配置的 `data` 参数（请求方式为 POST / PATCH / PUT / DELETE 时默认）
 *   'params': 将 payload 用作请求配置的 `params` 参数（请求方式为 GET / HEAD 时默认）
 *   'config': 将 payload 仅用于构建请求配置（详见 RESTful 章节）
 *   'cache': 将 payload 直接用作表单数据（不调用读取单条记录的接口）
 * @returns {Promise<any>} axiosConfig.form.read 的返回值
 */
form.open()
```

<br>

<a name="form.open-update"></a>

### 编辑

打开表单，并调用 `axiosConfig.form.read` 回显表单内容，提交时会调用 `axiosConfig.form.update`

```ts
const { form } = useAdmate()

form.update()

// 等价于：将表单形态设置为“编辑”，然后打开表单
form.status = 'update'
/**
 * PS: 以下为原始 form.open 的函数签名，如果你配置了 form.proxy.open ，则以 form.proxy.open 为准
 *
 * @param {any} [payload] 如果 payload 不为空，则会调用 axiosConfig.form.read
 * @param {'data'|'params'|'config'|'cache'} [payloadAs] 指定 payload 的用途
 *   'data': 将 payload 用作请求配置的 `data` 参数（请求方式为 POST / PATCH / PUT / DELETE 时默认）
 *   'params': 将 payload 用作请求配置的 `params` 参数（请求方式为 GET / HEAD 时默认）
 *   'config': 将 payload 仅用于构建请求配置（详见 RESTful 章节）
 *   'cache': 将 payload 直接用作表单数据（不调用读取单条记录的接口）
 * @returns {Promise<any>} axiosConfig.form.read 的返回值
 */
form.open()
```

<br>

### 删除

```ts
const { form } = useAdmate()

/**
 * @param {any} [payload]
 * @param {'data'|'params'|'config'} [payloadAs] 指定 payload 的用途
 *   'data': 将 payload 用作请求配置的 `data` 参数（请求方式为 POST / PATCH / PUT / DELETE 时默认）
 *   'params': 将 payload 用作请求配置的 `params` 参数（请求方式为 GET / HEAD 时默认）
 *   'config': 将 payload 仅用于构建请求配置（详见 RESTful 章节）
 * @returns {Promise<any>} axiosConfig.form.delete 的返回值
 */
form.delete()
```

<br>

### 状态变更

状态变更有三种方式：

1. 后端提供一个统一的接口，传参指定新的状态

```vue
<script setup>
import useAdmate from 'admate'

const { form } = useAdmate()

/**
 * @param {any} [payload]
 * @param {'data'|'params'|'config'} [payloadAs] 指定 payload 的用途
 *   'data': 将 payload 用作请求配置的 `data` 参数（请求方式为 POST / PATCH / PUT / DELETE 时默认）
 *   'params': 将 payload 用作请求配置的 `params` 参数（请求方式为 GET / HEAD 时默认）
 *   'config': 将 payload 仅用于构建请求配置（详见 RESTful 章节）
 * @returns {Promise<any>} axiosConfig.form.switch 的返回值
 */
form.switch()
</script>

<template>
  <el-table>
    <el-table-column
      label="操作"
      align="center"
    >
      <template #default="{ row: { id, status } }">
        <el-switch @change="form.switch({ id, status: status ^ 1 })" />
      </template>
    </el-table-column>
  </el-table>
</template>
```

2. 后端提供启用和停用两个接口

```vue
<script setup>
import useAdmate from 'admate'

const { form } = useAdmate({
  axiosConfig: {
    form: {
      switch: ({ id, status }) => ({
        method: 'PUT',
        url: `${status === 1 ? 'enable' : `disable`}/${id}`,
      }),
    }
  },
})

/**
 * @param {any} [payload]
 * @param {'data'|'params'|'config'} [payloadAs] 指定 payload 的用途
 *   'data': 将 payload 用作请求配置的 `data` 参数（请求方式为 POST / PATCH / PUT / DELETE 时默认）
 *   'params': 将 payload 用作请求配置的 `params` 参数（请求方式为 GET / HEAD 时默认）
 *   'config': 将 payload 仅用于构建请求配置（详见 RESTful 章节）
 * @returns {Promise<any>} axiosConfig.form.switch 的返回值
 */
form.switch()
</script>

<template>
  <el-table>
    <el-table-column
      label="操作"
      align="center"
    >
      <template #default="{ row: { id, status } }">
        <el-switch @change="form.switch({ id, status: status ^ 1 }, 'config')" />
      </template>
    </el-table-column>
  </el-table>
</template>
```

3. 后端未提供独立的接口，使用编辑接口改变状态

```vue
<script setup>
import useAdmate from 'admate'

const { form } = useAdmate({
  axiosConfig: {
    form: {
      update: {
        // ...
      },
      switch: {
        // 按编辑接口进行配置
      },
    }
  },
})

/**
 * @param {any} [payload]
 * @param {'data'|'params'|'config'} [payloadAs] 指定 payload 的用途
 *   'data': 将 payload 用作请求配置的 `data` 参数（请求方式为 POST / PATCH / PUT / DELETE 时默 认）
 *   'params': 将 payload 用作请求配置的 `params` 参数（请求方式为 GET / HEAD 时默认）
 *   'config': 将 payload 仅用于构建请求配置（详见 RESTful 章节）
 * @returns {Promise<any>} axiosConfig.form.switch 的返回值
 */
form.switch()
</script>

<template>
  <el-table>
    <el-table-column
      label="操作"
      align="center"
    >
      <template #default="{ row }">
        <el-switch @change="form.switch({ ...row, status: row.status ^ 1 })" />
      </template>
    </el-table-column>
  </el-table>
</template>
```

<br>

### 打开表单

#### form.open

打开表单，函数签名要分情况：

- [新增时](#form.open-create)
- [查看时](#form.open-read)
- [编辑时](#form.open-update)

#### form.proxy.open

你可以使用 `form.proxy.open` 来代理 `form.open`，以便在 `form.open` 前后执行一些操作，或改变 `form.open` 的行为

```ts
useAdmate({
  form: {
    proxy: {
      /**
       * @param {Function} openForm 被代理的原始 openForm
       * @returns {Promise<object> | object | void} object 为打开表单后 form 的终态
       */
      open(openForm) {},
    }
  }
})
```

```ts
// 示例: 回显表单后，修改表单数据

const { form } = useAdmate({
  form: {
    proxy: {
      open(openForm) {
        // 新增时 openForm 没有返回值
        return new Promise((resolve, reject) => {
          openForm()?.then((response) => {
            // response 为 axiosConfig.r 的接口返回值
            // 修改表单数据
            form.data.status = 1
            resolve()
          }).catch((e) => {
            reject(e)
          })
        })
      },
    }
  }
})
```

```ts
// 示例: 回显表单后，清除校验

useAdmate({
  form: {
    proxy: {
      open(openForm) {
        return new Promise((resolve, reject) => {
          openForm()?.finally(() => {
            formRef.value.clearValidate()
          }).then(() => {
            resolve()
          }).catch((e) => {
            reject(e)
          })
        })
      },
    }
  }
})
```

```ts
// 示例: 回显表单后，自定义表单的开闭和读取状态
useAdmate({
  form: {
    proxy: {
      open(openForm) {
        return new Promise((resolve, reject) => {
          // 可以在 finally 中 resolve
          openForm().then(() => {
            // 回显成功后，默认停止加载
            resolve({
              loading: false,
            })
          }).catch(() => {
            // 回显失败后，默认关闭表单并停止加载
            resolve({
              show: false,
              loading: false,
            })
          })
        })
      }
    }
  }
})

// 也可以返回一个对象（如果没有异步操作）
useAdmate({
  form: {
    proxy: {
      open(openForm) {
        return {
          loading: false
        }
      }
    }
  }
})
```

<br>

### 读取状态

`form.loading`

`axiosConfig.form.read` 被调用时值为 `true`，否则为 `false`

> 不能将该值当作表单回显结束的标志，因为复用列表数据时不会调用 axiosConfig.r

```vue
<!-- 示例 -->

<script setup>
import useAdmate from 'admate'

const { form } = useAdmate()
</script>

<template>
  <el-dialog>
    <el-form v-loading="form.loading" />
  </el-dialog>
</template>
```

<br>

### 提交表单

#### form.submit

提交表单，新增时调用 `axiosConfig.form.create`，编辑时调用 `axiosConfig.form.update`

```ts
const { form } = useAdmate()

/**
 * PS: 以下为原始 form.submit 的函数签名，如果你配置了 form.proxy.submit ，则以 form.proxy.submit 为准
 *
 * @param {any} [payload = form.data]
 * @param {'data'|'params'|'config'} [payloadAs] 指定 payload 的用途
 * @returns {Promise<any>} 接口返回值
 */
form.submit()
```

#### form.proxy.submit

你可以使用 `form.proxy.submit` 来代理 `form.submit` ，以便在 `form.submit` 前后执行一些操作，或改变 `form.submit` 的行为

```ts
useAdmate({
  form: {
    proxy: {
      /**
       * @param {Function} submitForm 被代理的原始 submitForm
       * @returns {Promise<object> | object | void} object 为提交表单后 form 的终态
       */
      submit(submitForm) {}
    }
  }
})
```

```ts
// 示例: 指定提交参数

form.submit({
  ...form.data,
  status: 1,
})

// form.submit 被代理时
useAdmate({
  form: {
    proxy: {
      submit(submitForm) {
        return new Promise((resolve, reject) => {
          submitForm({
            ...form.data,
            status: 1,
          }).then(() => {
            resolve()
          }).catch((e) => {
            reject(e)
          })
        })
      }
    }
  }
})
```

```ts
// 示例: 提交前校验表单

useAdmate({
  form: {
    proxy: {
      submit(submitForm) {
        return new Promise((resolve, reject) => {
          formRef.value.validate().then(() => {
            submitForm().then(() => {
              resolve()
            }).catch((e) => {
              reject(e)
            })
          })
        })
      }
    }
  }
})
```

```ts
// 示例: 提交表单后，自定义表单的开闭和提交状态

// 返回一个 promise
useAdmate({
  form: {
    proxy: {
      submit(submitForm) {
        return new Promise((resolve, reject) => {
          formRef.value.validate().then(() => {
            submitForm().then(() => {
              // 提交成功后，默认关闭表单，并停止加载
              resolve({
                show: false,
                submitting: false,
              })
            }).catch(() => {
              // 提交失败后，默认仅停止加载
              resolve({
                show: true,
                submitting: false,
              })
            })
          })
        })
      }
    }
  }
})

// 也可以返回一个对象（如果没有异步操作）
useAdmate({
  form: {
    proxy: {
      submit(submitForm) {
        return {
          show: false,
          submitting: false,
        }
      }
    }
  }
})
```

<br>

### 提交状态

`form.submitting`

`axiosConfig.form.create` 或 `axiosConfig.form.update` 被调用时值为 `true`，否则为 `false`

```vue
<!-- 示例 -->

<script setup>
import useAdmate from 'admate'

const { form } = useAdmate()
</script>

<template>
  <el-dialog>
    <template #footer>
      <el-button :loading="form.submitting">
        确 定
      </el-button>
    </template>
  </el-dialog>
</template>
```

<br>

## 生命周期

### 读取列表

```ts
useAdmateAdapter({}, {
  onListRead(res, trigger) {
    // res 为接口返回值，trigger 为调用动机
    // 可访问 this（组件实例）
  }
})
```

<br>

### 打开 / 读取表单

- 读取表单前

```ts
watch(() => form.value.show, (n) => {
  if (n) {
    // 打开表单
  }
})
```

- 读取表单后

```ts
// 示例: 适配层提供 onFormOpened

useAdmateAdapter({
  onFormOpened(res) {
    // res 为接口返回值（新增时为空）
    // 可访问 this（组件实例）
  }
})
```

- 读取表单后 (不含新增)

```ts
// 示例: 适配层提供 onFormRead

useAdmateAdapter({}, {
  onFormRead(res) {
    // res 为接口返回值
    // 可访问 this（组件实例）
  }
})
```

<br>

### 提交表单

- 提交表单前

```ts
useAdmateAdapter({
  onFormSubmit(form) {
    // 可访问 this（组件实例）
  }
})
```

- 提交表单后

```ts
useAdmateAdapter({
  onFormSubmitted(res) {
    // res 为接口返回值
    // 可访问 this（组件实例）
  }
})
```

<br>

### 关闭表单

```ts
watch(() => form.value.show, (n) => {
  if (!n) {
    // 关闭表单
  }
})
```

<br>

## 场景

### 表单是子组件

> 将表单抽离为子组件

[示例](https://github.com/cloydlau/admate/blob/main/demo/vue3/examples/FormExternalized.vue)

<br>

<a name="FormDecoupled"></a>

### 表单是独立页面

> 操作单条记录时，跳转到专用的表单页面，操作完毕后返回

[示例](https://github.com/cloydlau/admate/blob/main/demo/vue3/examples/FormDecoupled.vue)

<br>

### 只有表单没有列表

> 表单默认打开，且无法关闭，通常用于列表中只有一条数据，故列表被省略的场景

[示例](https://github.com/cloydlau/admate/blob/main/demo/vue3/examples/FormOnly.vue)

<br>

### 嵌套使用

> 当前页面的对话框也使用 Admate

[示例](https://github.com/cloydlau/admate/blob/main/demo/vue3/examples/Nested.vue)

<br>

## 更新日志

各版本详细改动请参考 [release notes](https://github.com/cloydlau/admate/releases)

<br>
