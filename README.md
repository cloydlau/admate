# Admate

管理后台伴侣，用简洁而不失灵活的方式开发管理后台页面，可以集成进任意管理后台框架如 [vue-vben-admin](https://github.com/anncwb/vue-vben-admin)
, [vue-element-admin](https://github.com/PanJiaChen/vue-element-admin) 中。

后台页面的特点是重复度高，如果提取公共代码又难以满足定制化需求，Admate 致力于解决这一痛点。

![我全都要](https://raw.githubusercontent.com/cloydlau/admate/master/我全都要.gif)

| 案例对比                                                                                                          | 技术栈                         |                                  业务代码量（字符数）                                   |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------ | :-------------------------------------------------------------------------------------: |
| [常规增删查改页面](https://github.com/PanJiaChen/vue-element-admin/blob/master/src/views/table/complex-table.vue) | Vue 2 + ElementUI              |                                         13,330                                          |
| 常规增删查改页面                                                                                                  | Vue 2 + ElementUI + **Admate** |                                      **约 5,000**                                       |
| 对接[支付宝进件](https://opendocs.alipay.com/pre-apis/00a8e3)                                                     | Vue 2 + ElementUI              |   89,293<br><span style="color:rgba(28,31,35,.6);font-size:12px;">（表单部分）</span>   |
| 对接[微信进件](https://pay.weixin.qq.com/wiki/doc/apiv3_partner/apis/chapter7_1_1.shtml)                          | Vue 2 + ElementUI + **Admate** | **38,718**<br><span style="color:rgba(28,31,35,.6);font-size:12px;">（表单部分）</span> |
| 电商后台的商品管理                                                                                                | Vue 2 + ElementUI              |                                         425,885                                         |
| 电商后台的商品管理（重构后）                                                                                      | Vue 2 + ElementUI + **Admate** |                                       **235,979**                                       |

<br>

## 特性

- 🕶 **Vue 2 & 3 通用** - 零成本升级
- 🤝 **不限制 UI 框架** - 只要技术栈是 Vue + Axios 便可使用，提供主流 UI 框架示例代码（Vuetify，Element，AntDesignVue，Quasar，PrimeVue）
- 🪝 **代理模式 + 控制反转** - 使用钩子函数的代理来量身打造生命周期的行为
- 🌐 **提供模块级的请求配置** - 虽然 Axios 支持全局配置，由于同模块内请求配置相似，接口前缀通常是一致的，所以往往还需要模块级别的配置
- 🍪 **贴心而不武断的 CRUD 封装**
    - 列表筛选：支持监听筛选参数 + 防抖控制接口调用频率的方式，也支持点击查询按钮触发的方式
    - 表单展现形式：支持对话框的形式，也支持独立页面的形式
    - 单条记录状态：支持分别调用启用/停用接口改变状态，也支持调用统一的更新状态接口指定新状态
    - 加载状态：提供列表读取状态、表单读取状态、表单提交状态的响应式变量
- 🧹 **周全的收尾工作，没有“后顾之忧”**
    - 关闭表单时，自动将表单绑定的数据恢复至初始状态（不是直接清空）
    - 删除当前分页最后一条记录时，自动切换至上一页（如果当前不在第一页）
- 🔌 **提供[适配层示例](https://github.com/cloydlau/admate/blob/master/demo/useAdmateAdapter.ts)**
  - 支持 URL 传参指定筛选项默认值
  - 支持动态生成筛选项默认值，使用场景举例：日期/时间类的参数，如果其默认值为当前最新时刻，重置筛选项时会重置到已过期的时刻
  - 自定义钩子函数：获取列表后 / 打开表单后 / 查询表单后 / 提交表单前
  - 列表筛选参数校验
  - 列表筛选参数重置

<br>

## 架构

![架构图](https://raw.githubusercontent.com/cloydlau/admate/master/architecture-diagram.png)

<br>

## 安装

![NPM](https://nodei.co/npm/admate.png)

### Vue 3

```bash
npm add admate
```

<br>

### Vue 2

```bash
# vue@2.6 或更早版本需要额外安装 @vue/composition-api
npm add admate
```

<br>

### 页面模板

> 搭配了 [kikimore](https://www.npmjs.com/package/kikimore)

1. 将 [vscode-code-snippets](https://github.com/cloydlau/vscode-code-snippets) 中的 `*.code-snippets` 文件拷贝至 `C:\Users\admin\AppData\Roaming\Code\User\snippets`
2. 使用方法：输入以下关键词，然后按 Tab：
   - `admate`: admate 页面模板
   - `admate:form-only`: admate 页面模板（只有表单没有列表的场景）
   - `KiFormDialog`: KiFormDialog 组件
   - `KiFormDialog.data`: KiFormDialog 组件的 data
   - `KiFormDialog:readonly`: KiFormDialog 组件（只读模式）
   - `KiFormDialog.data:readonly`: KiFormDialog 组件的 data（只读模式）
   - `KiSelect:options`: KiSelect 组件，本地数据源
   - `KiSelect:search`: KiSelect 组件，远程数据源
   - `KiSelect:index`: KiSelect 组件，绑定值为数组下标
   - `:props`: KiSelect 组件的 props 参数
   - `:options`: KiSelect 组件的 options 参数
   - `:search`: KiSelect 组件的 search 参数

<br>

### 代码生成器

接口文档一键生成页面模板代码，省去**从接口文档复制字段名至代码中**这一繁琐步骤

目前仅支持 YApi + element-ui

#### 安装

安装 Chrome / Edge 插件 **YApi2Code**，或使用离线版：

1. <a href="https://github.com/cloydlau/yapi2code-crx/blob/master/yapi2code-crx.zip?raw=true" download>下载离线包</a>后解压

2. 打开浏览器**扩展程序**，并开启**开发者模式**

3. 点击**加载已解压的扩展程序**，选择解压后的文件夹

#### 使用

1. 访问 YApi，选中相应模块的**查询列表**接口

2. 点击浏览器右上角运行插件

3. 点击**生成代码**，代码将被复制至剪贴板

4. 创建页面文件 `xxx.vue`，粘贴代码

<br>

### 搭配 Vuetify

<img src="https://img.shields.io/npm/dm/vuetify.svg"> <img src="https://img.shields.io/github/stars/vuetifyjs/vuetify">

[Vuetify@3 示例](https://github.com/cloydlau/admate/blob/master/demo/vue3/UseUIFramework/Vuetify.vue) 

[Vuetify@2 示例](https://github.com/cloydlau/admate/blob/master/demo/vue2/UseUIFramework/Vuetify.vue)

<br>

### 搭配 ElementUI

<img src="https://img.shields.io/npm/dm/element-ui.svg"> <img src="https://img.shields.io/github/stars/ElemeFE/element">

[示例](https://github.com/cloydlau/admate/blob/master/demo/vue2/UseUIFramework/ElementUI.vue)

<br>

### 搭配 ElementPlus

<img src="https://img.shields.io/npm/dm/element-plus.svg"> <img src="https://img.shields.io/github/stars/element-plus/element-plus">

[示例](https://github.com/cloydlau/admate/blob/master/demo/vue3/UseUIFramework/ElementPlus.vue)

<br>

### 搭配 AntDesignVue

<img src="https://img.shields.io/npm/dm/ant-design-vue.svg"> <img src="https://img.shields.io/github/stars/vueComponent/ant-design-vue">

[AntDesignVue@2 示例](https://github.com/cloydlau/admate/blob/master/demo/vue3/UseUIFramework/AntDesignVue.vue)

[AntDesignVue@1 示例](https://github.com/cloydlau/admate/blob/master/demo/vue2/UseUIFramework/AntDesignVue.vue)

<br>

### 搭配 Quasar

<img src="https://img.shields.io/npm/dm/quasar.svg"> <img src="https://img.shields.io/github/stars/quasarframework/quasar">

[Quasar@2 示例](https://github.com/cloydlau/admate/blob/master/demo/vue3/UseUIFramework/Quasar.vue)

Quasar@1（应该）不支持 Vite，暂无示例

<br>

### 搭配 PrimeVue

<img src="https://img.shields.io/npm/dm/primevue.svg"> <img src="https://img.shields.io/github/stars/primefaces/primevue">

[PrimeVue@3 示例](https://github.com/cloydlau/admate/blob/master/demo/vue3/UseUIFramework/PrimeVue.vue)

PrimeVue@2（应该）不支持 Vite，暂无示例

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
    // 查询列表
    getList: {
      method: 'GET',
    },
    // 新增一条记录（submitForm 在新增时调用）
    c: {
      method: 'POST',
    },
    // 查询一条记录（openForm 在查看、编辑时调用）
    r: {
      method: 'GET',
    },
    // 编辑一条记录（submitForm 在编辑时调用）
    u: {
      method: 'PUT',
    },
    // 删除一条记录
    d: {
      method: 'DELETE',
    },
    // 启用一条记录
    enable: {
      method: 'PUT',
    },
    // 禁用一条记录
    disable: {
      method: 'PUT',
    },
    // 变更一条记录的状态
    updateStatus: {
      method: 'PUT',
    },
  },
})
```

<br>

### urlPrefix

```ts
useAdmate({
  // axiosConfig 中各个接口的 URL 前缀
  urlPrefix: '',
})
```

```ts
// 示例：URL 前缀不统一

useAdmate({
  urlPrefix: 'somepage',
  axiosConfig: {
    r: {
      // 如果某个接口的前缀不是 'somepage'，可以在 URL 前面加斜线，即可忽略该前缀
      url: '/anotherpage/selectOne',
    },
  }
})
```

<br>

### RESTful

如果接口地址需要进行动态拼接

```ts
<!-- 示例 -->

// 配置
const { openForm, d, enable, disable, updateStatus } = useAdmate({
  axiosConfig: {
    // 查询列表
    getList: payload => ({
      method: 'GET',
      url: 'module/' + payload.xxx
    }),
    // 查询一条记录（openForm 在查看、编辑时调用）
    r: payload => ({
      method: 'GET',
      url: 'module/' + payload.id
    }),
    // 编辑一条记录（submitForm 在编辑时调用）
    u: payload => ({
      method: 'PUT',
      url: 'module/' + payload.id
    }),
    // 删除一条记录
    d: payload => ({
      method: 'DELETE',
      url: 'module/' + payload.id
    }),
    // 启用一条记录
    enable: payload => ({
      method: 'PUT',
      url: 'module/' + payload.id
    }),
    // 禁用一条记录
    disable: payload => ({
      method: 'PUT',
      url: 'module/' + payload.id
    }),
    // 变更一条记录的状态
    updateStatus: payload => ({
      method: 'PUT',
      url: 'module/' + payload.id
    }),
  }
})

// 使用
openForm({ id: 1 }, 'config')
d({ id: 1 }, 'config')
enable({ id: 1 }, 'config')
disable({ id: 1 }, 'config')
updateStatus({ id: 1 }, 'config')
```

<br>

### FormData

Axios 的 data 默认以 `application/json` 作为 MIME type，如果你需要使用 `multipart/form-data`：

- 全局配置

给你的 Axios 配置 `transformRequest`、`headers['Content-Type']`

- 局部配置

`getList`、`openForm`、`d`、`updateStatus`、`enable`、`disable`、`submitForm` 的参数 1 均支持 FormData 类型

```vue
<!-- 示例：局部配置 -->

<template>
  <el-table>
    <el-table-column label="操作">
      <template #default="{ row: { id } }">
        <el-button @click="r(FormData.from({ id }))">查看</el-button>
        <el-button @click="u(FormData.from({ id }))">编辑</el-button>
        <el-button @click="d(FormData.from({ id }))">删除</el-button>
      </template>
    </el-table-column>
  </el-table>

  <el-dialog>
    <template #footer>
      <el-button @click="submitForm(FormData.from( form.data ))">
        确 定
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
import useAdmate from 'admate'
import { jsonToFormData, pickDeepBy } from 'kayran'

export default {
  setup: () => {
    // 过滤参数并转换为 FormData
    // 此处示例为将过滤方法绑定到 window.FormData，方便其他地方使用
    FormData.from = data => jsonToFormData(pickDeepBy(data, (v, k) => ![NaN, null, undefined].includes(v)))

    // 直接转换为 FormData
    //FormData.from = jsonToFormData

    const admate = useAdmate({
      getListProxy (getList, trigger) {
        getList(FormData.from(list.filter))
      },
    })
    
    return {
      ...admate,
      r: (...args) => {
        admate.form.status = 'r'
        admate.openForm(...args)
      },
      u: (...args) => {
        admate.form.status = 'u'
        admate.openForm(...args)
      },
      FormData
    }
  }
}
</script>
```

<br>

## 列表

### 筛选参数

`list.filter`

```ts
useAdmate({
  list: {
    // 可以在这里提供筛选参数的默认值
    filter: {
      [list.pageNumberKey]: 1,
    },

    // 必填
    // 页码的参数名
    pageNumberKey: undefined,
  },
})
```

如果你的参数筛选项中包含 `el-checkbox` 组件，则必须在 data 中声明其初始值，否则将导致无法正确重置（element-ui 的 Bug）

```vue
<!-- 示例 -->

<template>
  <el-form ref="listFilterRef" :model="list.filter" inline>
    <el-form-item prop="effect">
      <el-checkbox
        v-model="list.filter.effect"
        label="生效"
        border
      />
    </el-form-item>
    <el-button @click="reset">重置</el-button>
  </el-form>
</template>

<script>
import useAdmate from 'admate'

export default {
  setup: () => useAdmate({
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

### 触发查询

- 点击专用的查询按钮触发
    - :x: 操作相对繁琐。
    - :x: 列表数据与筛选条件可能是无关的。可能产生“当前的列表数据是否基于筛选项？”的顾虑，导致徒增点击查询按钮的次数。
    - :heavy_check_mark: 想同时设置多个筛选条件时，只调用一次接口，不会造成资源浪费。

```ts
useAdmate({
  list: {
    watchFilter: false,
  }
})
```

<hr>

- **改变筛选条件后即时触发**
    - :heavy_check_mark: 操作相对简便。
    - :heavy_check_mark: 列表数据与筛选条件即时绑定。
    - :heavy_check_mark: ~~想同时设置多个筛选条件时，接口会被多次调用，造成资源浪费~~（Admate 已优化）。

```ts
useAdmate({
  list: {
    watchFilter: true, // 默认值

    // 防抖间隔，单位毫秒
    // 如果筛选参数不含 input 类型，可以设置为 0，即不防抖
    // 翻页不会触发防抖
    // watchFilter 开启时有效
    debounceInterval: 300, // 默认值
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

    // 指定接口返回值中列表数据所在的位置
    // 支持属性名如 'data'，属性路径如 'data.records'
    // 还支持 function，如 response => response.data
    dataAt: undefined,

    // 指定接口返回值中记录总数所在的位置
    // 支持属性名如 'total'，属性路径如 'data.total'
    // 还支持 function，如 response => response.total + 1
    totalAt: undefined,
  }
})
```

<br>

### 读取状态

`list.loading`

`axiosConfig.getList` 被调用时值为 `true`，否则为 `false`

```vue
<!-- 示例 -->

<template>
  <el-table v-loading="list.loading"/>
</template>

<script>
import useAdmate from 'admate'

export default {
  setup: () => {
    const { list } = useAdmate()
    return { list }
  },
  methods: {
    handleTable () {
      this.list.loading = true
      this.$POST('').finally(() => {
        this.list.loading = false
      })
    }
  }
}
</script>
```

<br>

### Hook: 查询列表时

`getList` ：获取列表，在首次进入页面、列表筛选参数改变、单条记录增删查改后会被调用

```ts
const {
  /**
   * PS：以下为原始 getList 的函数签名，如果你配置了 getListProxy，则以 getListProxy 为准
   *
   * @param {any} [payload = list.filter]
   * @param {'data'|'params'|'config'} [payloadAs] 指定 payload 的用途
   * @returns {Promise<any>} 接口返回值
   */
  getList
} = useAdmate()

getList() // 手动查询
```

`getListProxy`：你可以使用 `getListProxy` 来代理 `getList`，以便在 getList 前后做一些操作，或改变 getList 的行为

```ts
useAdmate({
  /**
   * @param {Function} getList 被代理的原始 getList
   * @param {string} trigger 调用动机 可能的值：'init' 'pageNumberChange' 'filterChange' 'c' 'r' 'u' 'd' 'updateStatus' 'enable' 'disable'
   */
  getListProxy (getList, trigger) {},
})
```

```ts
// 示例：获取列表之前，校验参数

useAdmate({
  getListProxy (getList, trigger) {
    if (trigger === 'filterChange') {
      listFilterRef.value.validate().then(() => {
        getList()
      })
    } else {
      getList()
    }
  },
})
```

```ts
// 示例：单条记录操作成功后，弹出提示

useAdmate({
  getListProxy (getList, trigger) {
    getList()
    if (['c', 'u', 'd', 'updateStatus', 'enable', 'disable'].includes(trigger)) {
      currentInstance.value.$message.success('操作成功')
    }
  },
})
```

```ts
// 示例：获取列表后，修改列表数据

const { list } = useAdmate({
  getListProxy (getList, trigger) {
    getList().then(response => {
      // response 为 axiosConfig.getList 的接口返回值
      list.data = response.data?.filter(v => !v.disabled)
    })
  },
})
```

<a class="anchor-fix" name="openForm-c"></a>

<br>

## 表单

### 新增

打开表单，提交时会调用 `axiosConfig.c`

```ts
const { form, openForm } = useAdmate()

// 将表单形态设置为“新增”，然后打开表单
form.status = 'c'
openForm()
```

<a class="anchor-fix" name="openForm-r"></a>

<br>

### 查看

打开表单，并调用 `axiosConfig.r` 回显表单内容

```ts
const { form, openForm } = useAdmate()

// 将表单形态设置为“查看”，然后打开表单
form.status = 'r'
/**
 * PS：以下为原始 openForm 的函数签名，如果你配置了 openFormProxy ，则以 openFormProxy 为准
 *
 * @param {any} [payload] 如果 payload 不为空，则会调用 axiosConfig.r
 * @param {'data'|'params'|'config'|'cache'} [payloadAs] 指定 payload 的用途
 *   'data': 将 payload 用作请求配置的 `data` 参数（请求方式为 POST / PATCH / PUT / DELETE 时默认）
 *   'params': 将 payload 用作请求配置的 `params` 参数（请求方式为 GET / HEAD 时默认）
 *   'config': 将 payload 仅用于构建请求配置（详见 RESTful 章节）
 *   'cache': 将 payload 直接用作表单数据（不调用查询单条记录的接口）
 * @returns {Promise<any>} axiosConfig.r 的返回值
 */
openForm()
```

<a class="anchor-fix" name="openForm-u"></a>

<br>

### 编辑

打开表单，并调用 `axiosConfig.r` 回显表单内容，提交时会调用 `axiosConfig.u`

```ts
const { form, openForm } = useAdmate()

// 将表单形态设置为“编辑”，然后打开表单
form.status = 'u'
/**
 * PS：以下为原始 openForm 的函数签名，如果你配置了 openFormProxy，则以 openFormProxy 为准
 *
 * @param {any} [payload] 如果 payload 不为空，则会调用 axiosConfig.r
 * @param {'data'|'params'|'config'|'cache'} [payloadAs] 指定 payload 的用途
 *   'data': 将 payload 用作请求配置的 `data` 参数（请求方式为 POST / PATCH / PUT / DELETE 时默认）
 *   'params': 将 payload 用作请求配置的 `params` 参数（请求方式为 GET / HEAD 时默认）
 *   'config': 将 payload 仅用于构建请求配置（详见 RESTful 章节）
 *   'cache': 将 payload 直接用作表单数据（不调用查询单条记录的接口）
 * @returns {Promise<any>} axiosConfig.r 的返回值
 */
openForm()
```

<br>

### 删除

```ts
const {
  /**
   * @param {any} [payload]
   * @param {'data'|'params'|'config'} [payloadAs] 指定 payload 的用途
   *   'data': 将 payload 用作请求配置的 `data` 参数（请求方式为 POST / PATCH / PUT / DELETE 时默认）
   *   'params': 将 payload 用作请求配置的 `params` 参数（请求方式为 GET / HEAD 时默认）
   *   'config': 将 payload 仅用于构建请求配置（详见 RESTful 章节）
   * @returns {Promise<any>} axiosConfig.d 的返回值
   */
  d
} = useAdmate()
```

<br>

### 状态变更

状态变更有两种方式：

1. 后端只提供一个接口，传参指定新的状态
2. 后端提供启用和停用两个接口

```vue
<!-- 方式一：使用 updateStatus -->

<template>
  <el-table>
    <el-table-column label="操作" align="center">
      <template slot-scope="{ row: { id, status } }">
        <el-switch @change="updateStatus({ id, status: status^1 })"/>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import useAdmate from 'admate'

export default {
  setup: () => {
    const {
      /**
       * @param {any} [payload]
       * @param {'data'|'params'|'config'} [payloadAs] 指定 payload 的用途
       *   'data': 将 payload 用作请求配置的 `data` 参数（请求方式为 POST / PATCH / PUT / DELETE 时默认）
       *   'params': 将 payload 用作请求配置的 `params` 参数（请求方式为 GET / HEAD 时默认）
       *   'config': 将 payload 仅用于构建请求配置（详见 RESTful 章节）
       * @returns {Promise<any>} axiosConfig.updateStatus 的返回值
       */
      updateStatus,
    } = useAdmate()
    return { updateStatus }
  }
}
</script>
```

```vue
<!-- 方式二：使用 enable 和 disable -->

<template>
  <el-table>
    <el-table-column label="操作" align="center">
      <template slot-scope="{ row: { id, status } }">
        <el-switch @change="[enable,disable][status]({id})"/>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import useAdmate from 'admate'

export default {
  setup: () => {
    const {
      /**
       * @param {any} [payload]
       * @param {'data'|'params'|'config'} [payloadAs] 指定 payload 的用途
       *   'data': 将 payload 用作请求配置的 `data` 参数（请求方式为 POST / PATCH / PUT / DELETE 时默认）
       *   'params': 将 payload 用作请求配置的 `params` 参数（请求方式为 GET / HEAD 时默认）
       *   'config': 将 payload 仅用于构建请求配置（详见 RESTful 章节）
       * @returns {Promise<any>} axiosConfig.enable 的返回值
       */
      enable,

      /**
       * @param {any} [payload]
       * @param {'data'|'params'|'config'} [payloadAs] 指定 payload 的用途
       *   'data': 将 payload 用作请求配置的 `data` 参数（请求方式为 POST / PATCH / PUT / DELETE 时默认）
       *   'params': 将 payload 用作请求配置的 `params` 参数（请求方式为 GET / HEAD 时默认）
       *   'config': 将 payload 仅用于构建请求配置（详见 RESTful 章节）
       * @returns {Promise<any>} axiosConfig.disable 的返回值
       */
      disable
    } = useAdmate()
    return { enable, disable }
  }
}
</script>
```

<br>

### 表单数据

`form.data`

```ts
useAdmate({
  form: {
    // 可以在这里提供表单数据的默认值
    data: {},

    // 在查看、编辑表单时，可能需要调用接口（axiosConfig.r）回显表单的数据
    // dataAt 用于指定接口返回值中表单数据所在的位置
    // 支持属性名如 'data'，属性路径如 'data.detail'
    // 还支持 function，如 response => response.data
    dataAt: undefined,

    // 接口（axiosConfig.r）返回值与 form.data 合并的方式
    mergeData: 'deep',
  },
})
```

**mergeData:**

- `'deep'`: 深合并（默认）
- `'shallow'`: 浅合并
- `(newFormData: any) => any`: 自定义合并方式
- `false`: 不合并，直接替换

**为什么默认是深合并？**

在 Vue 2 中，template 不支持 `?.` 语法，要在 template 中判空，代码写起来会非常冗余，通常的做法是在 data 中声明空对象

比如给 form.data 提供默认值：

```vue

<template>
  {{ form.data.a.b.c }}
</template>

<script>
import useAdmate from 'admate'

export default {
  setup: () => {
    const { form } = useAdmate({
      form: {
        data: {
          a: {
            b: {}
          }
        }
      }
    })
    return { form }
  }
}
</script>
```

如果 axiosConfig.r 的返回值为：
`{ a: {} }`

如果与默认值<span style="color:red">浅合并</span>后将得到：
`{ a: {} }` —— 默认值中的对象b丢失了，引发空指针异常。

如果与默认值<span style="color:red">深合并</span>后将得到：
`{ a: { b: {} } }` —— 代码正常工作。

```ts
// 示例：自定义合并方式

import { mergeWith } from 'lodash'

const defaultFormData = () => ({
  a: {
    b: {}
  }
})

const { form } = useAdmate({
  form: {
    data: defaultFormData(),
    // 接口返回值中嵌套的对象可能为 null，会覆盖默认值中的空对象
    mergeData (
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

#### 表单形式

表单默认是对话框的形式，但也支持[表单是独立页面](#FormDecoupled) 的情况

对比

- 对话框：体验好，割裂感低，表单的开闭不影响父页面状态
- 独立页面：体验较差，从表单返回父页面时，父页面的状态会丢失，比如列表筛选状态

<hr>

#### `form.show`

表单是否打开

```ts
// 类型

boolean
```

<hr>

#### `form.status`

表单的形态

```ts
// 类型

type StatusType = '' | 'c' | 'r' | 'u' | string

// 分别表示关闭、新增、查看、编辑、自定义
```

`form.show` 为 `false` 时，`form.status` 为 `''`

<hr>

#### 交叉形态

比如“复制新增”：表单的初始数据不是空白，而是复制一条已有的记录。

1. 打开表单时，和查看/编辑一样，需要调接口回显
2. 调用的接口是新增的接口
3. 表单名称显示为“复制新增”

对于这种需求，没有必要专门增加一种表单形态，可以借助一个辅助变量如 `isCopy`，用 `isCopy && form.status ==='c'` 来判断是不是复制新增，然后给 `openForm` 传参即可回显。

<br>

### 读取状态

`form.loading`

`axiosConfig.r` 被调用时值为 `true`，否则为 `false`

> 不能将该值当作表单回显结束的标志，因为复用列表数据时不会调用 axiosConfig.r

```vue
<!-- 示例 -->

<template>
  <el-dialog>
    <el-form v-loading="form.loading"/>
  </el-dialog>
</template>

<script>
import useAdmate from 'admate'

export default {
  setup: () => {
    const { form } = useAdmate()
    return { form }
  }
}
</script>
```

<br>

### 提交状态

`form.submitting`

`axiosConfig.c` 或 `axiosConfig.u` 被调用时值为 `true`，否则为 `false`

```vue
<!-- 示例 -->

<template>
  <el-dialog>
    <template #footer>
      <el-button :loading="form.submitting">
        确 定
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
import useAdmate from 'admate'

export default {
  setup: () => {
    const { form } = useAdmate()
    return { form }
  }
}
</script>
```

<br>

### Hook: 打开表单时

`openForm` ：打开表单，函数签名要分情况：

- [新增时](#openForm-c)
- [查看时](#openForm-r)
- [编辑时](#openForm-u)

`openFormProxy`：你可以使用 `openFormProxy` 来代理 `openForm`，以便在 openForm 前后做一些操作，或改变 openForm 的行为

```ts
useAdmate({
  /**
   * @param {Function} openForm 被代理的原始 openForm
   * @returns {Promise<object> | object | void} object 为打开表单后 form 的终态
   */
  openFormProxy (openForm) {},
})
```

<hr>

```ts
// 示例：回显表单后，修改表单数据

const { form } = useAdmate({
  openFormProxy (openForm) {
    // 新增时 openForm 没有返回值
    return new Promise((resolve, reject) => {
      openForm()?.then(response => {
        // response 为 axiosConfig.r 的接口返回值
        // 修改表单数据
        form.data.status = 1
        resolve()
      }).catch(() => {
        reject()
      })
    })
  },
})
```

```ts
// 示例：回显表单后，清除校验

useAdmate({
  openFormProxy (openForm) {
    return new Promise((resolve, reject) => {
      openForm()?.finally(() => {
        formRef.value.clearValidate()
      }).then(() => {
        resolve()
      }).catch(() => {
        reject()
      })
    })
  },
})
```

```ts
// 示例：回显表单后，自定义表单的开闭和读取状态
useAdmate({
  openFormProxy (openForm) {
    return new Promise((resolve, reject) => {
      // 可以在 finally 中 resolve
      openForm().then(() => {
        // 回显成功后，默认停止加载
        resolve({
          loading: false,
        })
      }).catch(() => {
        // 回显失败后，默认关闭表单并停止加载
        reject({
          show: false,
          loading: false,
        })
      })
    })
  }
})

// 也可以返回一个对象（如果没有异步操作）
useAdmate({
  openFormProxy (openForm) {
    return {
      loading: false
    }
  }
})
```

<br>

### Hook: 提交表单时

`submitForm` ：提交表单，新增时调用 `axiosConfig.c`，编辑时调用 `axiosConfig.u`

```ts
const {
  /**
   * PS：以下为原始 submitForm 的函数签名，如果你配置了 submitFormProxy ，则以 submitFormProxy 为准
   *
   * @param {any} [payload = form.data]
   * @param {'data'|'params'|'config'} [payloadAs] 指定 payload 的用途
   * @returns {Promise<any>} 接口返回值
   */
  submitForm
} = useAdmate()
```

`submitFormProxy`：你可以使用 `submitFormProxy` 来代理 `submitForm`，以便在 submitForm 前后做一些操作，或改变submitForm的行为

```ts
useAdmate({
  /**
   * @param {Function} submitForm 被代理的原始 submitForm
   * @returns {Promise<object> | object | void} object 为提交表单后 form 的终态
   */
  submitFormProxy (submitForm) {}
})
```

<hr>

```ts
// 示例：指定提交参数

submitForm({
  ...form.data,
  status: 1,
})

// submitForm 被代理时
useAdmate({
  submitFormProxy (submitForm) {
    return new Promise((resolve, reject) => {
      submitForm({
        ...form.data,
        status: 1,
      }).then(() => {
        resolve()
      }).catch(() => {
        reject()
      })
    })
  }
})
```

```ts
// 示例：提交前校验表单

useAdmate({
  submitFormProxy (submitForm) {
    return new Promise((resolve, reject) => {
      formRef.value.validate().then(() => {
        submitForm().then(() => {
          resolve()
        }).catch(() => {
          reject()
        })
      })
    })
  }
})
```

```ts
// 示例：提交表单后，自定义表单的开闭和提交状态

// 返回一个 promise
useAdmate({
  submitFormProxy (submitForm) {
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
          reject({
            show: true,
            submitting: false,
          })
        })
      })
    })
  }
})

// 也可以返回一个对象（如果没有异步操作）
useAdmate({
  submitFormProxy (submitForm) {
    return {
      show: false,
      submitting: false,
    }
  }
})
```

<br>

## 示例：表单是子组件

将表单抽离为子组件

[示例](https://github.com/cloydlau/admate/blob/master/demo/vue3/examples/FormExternalized.vue)

<a class="anchor-fix" name="FormDecoupled"></a>

<br>

## 示例：表单是独立页面

操作单条记录时，跳转到专用的表单页面，操作完毕后返回

[示例](https://github.com/cloydlau/admate/blob/master/demo/vue3/examples/FormDecoupled.vue)

<br>

## 示例：只有表单没有列表

表单默认打开，且无法关闭，通常用于列表中只有一条数据，故列表被省略的场景

[示例](https://github.com/cloydlau/admate/blob/master/demo/vue3/examples/FormOnly.vue)

<br>

## 示例：嵌套使用

嵌套其它也使用 Admate 的页面

[示例](https://github.com/cloydlau/admate/blob/master/demo/vue3/examples/Nested.vue)

<br>

![Alt](https://repobeats.axiom.co/api/embed/96d9b8e4c191488faaa6e4545b684afd114c6cdd.svg "Repobeats analytics image")
