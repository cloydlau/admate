# Admate / 管理后台伴侣

`Admate` 的目标是以快速简洁的方式开发管理后台页面，

并在此基础上确保灵活可配，杜绝过度封装。

## Features

- 同时支持Vue2 & Vue3
- 不限制UI框架，只要技术栈是Vue和axios，便可以使用
- 同一系统内，CRUD的请求配置通常是相似的，同一模块内，接口前缀通常是一致的，Admate可以帮助你减少冗余代码
- 提供列表、单条记录CRUD的贴心封装
    - 你不再操心列表的读取状态、表单的读取和提交状态
    - 支持监听筛选参数自动刷新列表，且节流控制接口调用频率
- 提供接口调用捷径（含上传、下载）

周全的收尾工作，没有“后顾之忧”：

- 关闭表单时，自动将表单绑定的数据恢复至初始状态（不是直接清空）
- 删除当前分页最后一条记录时，自动切换至上一页（如果当前不在第一页）
- 离开页面时，自动终止尚未完成的请求

<br>

## 过往版本的文档

<a href="https://www.npmjs.com/package/admate/v/0.5.4">https://www.npmjs.com/package/admate/v/0.5.4</a>

> 将链接末尾替换为你想要查看的版本号即可

<br>

## Installation

![NPM](https://nodei.co/npm/admate.png)

### Vue 3

```bash
pnpm add admate vue@3 axios
```

<br>

### Vue 2

```bash
pnpm add admate vue@2 axios @vue/composition-api
```

### 初始化

[示例代码](https://github.com/cloydlau/admate/blob/vue3/demo/useMyAdmate.ts)

<br>

### 使用代码生成器

使用代码生成器生成页面模板

::: warning  
目前仅支持 `element-ui`
:::

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

### 搭配ElementPlus

[示例代码](https://github.com/cloydlau/admate/blob/vue3/demo/UseUIFramework/ElementPlus.vue)

<br>

### 搭配ElementUI

[示例代码](https://github.com/cloydlau/admate/blob/vue3/demo/UseUIFramework/ElementUI.vue)

<br>

### 搭配AntDesignVue@2

[示例代码](https://github.com/cloydlau/admate/blob/vue3/demo/UseUIFramework/AntDesignVue.vue)

<br>

### 搭配AntDesignVue@1

[示例代码](https://github.com/cloydlau/admate/blob/vue3/demo/UseUIFramework/AntDesignVue1.vue)

<br>

### 搭配Vuetify@3

[Vuetify@3](https://next.vuetifyjs.com/zh-Hans/components/app-bars/) 仍处于Alpha阶段

<br>

### 搭配Vuetify@2

[示例代码](https://github.com/cloydlau/admate/blob/vue3/demo/UseUIFramework/Vuetify2.vue)

<br>

### 搭配Quasar@2

Quasar@2尚不支持 `Vite`，[进度追踪](https://github.com/quasarframework/quasar/issues/10398)

<br>

## 接口配置

### axios

```ts
useAdmate({
  // axios或axios实例
  // 用于调用接口
  axios,
})
```

<br>

### axiosConfig

```ts
useAdmate({
  axiosConfig: {
    // 查询列表
    getList: {
      method: 'GET',
    },
    // 新增一条记录
    c: {
      method: 'POST',
    },
    // 查询一条记录
    r: {
      method: 'GET',
    },
    // 编辑一条记录
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
  // axiosConfig中各个接口的url前缀
  urlPrefix: '',
})
```

```ts
// 示例：URL前缀不统一

useAdmate({
  urlPrefix: 'somepage',
  axiosConfig: {
    r: {
      // 如果某个接口的前缀不是'somepage'，可以在URL前面加斜线，即可忽略该前缀
      url: '/anotherpage/selectOne',
    },
  }
})
```

<br>

<a name="RESTful"><br></a>

### RESTful

如果接口地址需要进行动态拼接

```ts
<!-- 示例 -->

// 配置
const { r, u } = useAdmate({
  axiosConfig: {
    r: config => ({
      url: 'module/' + config.id
    }),
  }
})

// 使用
r(row, 'config')
u(row, 'config')
```

<br>

### FormData

axios的data默认以 `application/json` 作为MIME type，如果你需要使用 `multipart/form-data`：

- 全局配置

给你的axios配置 `transformRequest`、`headers['Content-Type']`

- 局部配置

`getList`、`r`、`u`、`d`、`updateStatus`、`enable`、`disable`、`submit` 的参数1均支持FormData类型

```vue
<!-- 示例：局部配置 -->

<script setup>
import { ref } from '@vue/composition-api'
import useAdmate from 'admate'
import { jsonToFormData, pickDeepBy } from 'kayran'

// 过滤参数并转换为FormData
// 此处示例为将过滤方法绑定到window.FormData，方便其他地方使用
window.FormData.from = data => jsonToFormData(pickDeepBy(data, (v, k) => ![NaN, null, undefined].includes(v))

// 直接转换为FormData
//window.FormData.from = jsonToFormData

useAdmate({
  getListProxy (getList, caller) {
    getList(FormData.from(list.value.filter))
  },
})

// 以便在template中使用
const FormData = ref(window.FormData)
</script>
```

<br>

### 接口调用捷径

#### AJAX

```ts
import { createAxiosShortcut } from 'admate'
import request from '@/utils/request'
const axiosShortcut = createAxiosShortcut(
  request // axios或axios实例
)

// 注册全局方法
for (let k in axiosShortcut) {
  // Vue 3
  app.config.globalProperties[`$${k}`] = axiosShortcut[k]

  // Vue 2
  Object.defineProperty(Vue.prototype, `$${k}`, {
    value: axiosShortcut[k]
  })
}

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

// 或者直接使用
axiosShortcut.POST()
```

<br>

#### 上传

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

#### 下载

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

## 列表

### 列表数据

`list.data`

```ts
useAdmate({
  list: {
    // 列表数据
    data: [],

    // 指定接口返回值中列表数据所在的位置
    // 支持属性名如'data'，属性路径如'data.records'
    // 还支持function，如response => response.data
    dataAt: undefined,

    // 指定接口返回值中记录总数所在的位置
    totalAt: undefined,
  }
})
```

<br>

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

::: danger  
如果你的参数筛选项中包含 `el-checkbox` 组件，则必须在 data 中声明其初始值，否则将导致无法正确重置（element-ui 的 bug）
:::

```vue
<!-- 示例 -->

<template>
  <el-form ref="listFilterFormRef" :model="list.filter" inline>
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

- 点击专用的 `查询` 按钮触发
    - :x: 操作相对繁琐。
    - :x: 列表数据与筛选条件可能是无关的。可能产生“当前的列表数据是否基于筛选项？”的顾虑，导致徒增点击查询按钮的次数。
    - :heavy_check_mark: 想要同时设置多个筛选条件时，只调用一次接口，不会造成资源浪费。

```ts
useAdmate({
  list: {
    watchFilter: false,
  }
})
```

<br>

- **改变筛选条件后即时触发**
    - :heavy_check_mark: 操作相对简便。
    - :heavy_check_mark: 列表数据与筛选条件即时绑定。
    - :heavy_check_mark: ~~想要同时设置多个筛选条件时，接口会被多次调用，造成资源浪费~~（Admate已优化）。

```ts
useAdmate({
  list: {
    watchFilter: true, // 默认值

    // 节流间隔，单位毫秒
    // 如果筛选参数不含input类型，可以设置为0，即不节流
    // 翻页不会触发节流
    // watchFilter开启时有效
    throttleInterval: 500, // 默认值
  }
})
```

<a name="query-table"><br></a>

### 手动查询

```ts
const {
  /**
   * @param {any} [payload]
   * @param {string} [payloadUse] 指定payload的用途
   * @returns {Promise<any>} 接口返回值
   */
  getList
} = useAdmate()
```

<br>

### 加载状态

`list.loading`

```ts
export default {
  methods: {
    handleTable () {
      this.list.value.loading = true
      this.$POST('')
      .finally(() => {
        this.list.value.loading = false
      })
    }
  }
}
```

<br>

### Hook: 查询列表时

`getList` ：获取列表，在首次进入页面、列表筛选参数改变、单条记录增删查改后会被调用

`getListProxy`：你可以使用 `getListProxy` 来代理 `getList`，以便在getList前后做一些操作，或改变getList的行为

```ts
useAdmate({
  /**
   * @param {(payload?: object, payloadUse?: string) => Promise<any> | void,} getList 被代理的方法
   * @param {string} caller 调用动机 可能的值：'init' 'pageNumberChange' 'filterChange' 'c' 'r' 'u' 'd' 'updateStatus' 'enable' 'disable'
   */
  getListProxy (getList, caller) {
    // 在查询列表之前做点什么...
    getList({
      // 自定义接口参数
    })
    .then(res => {
      // 在查询列表之后做点什么...
    })
  },
})
```

<br>

## 单条记录

### 表单数据

`row.data`

```ts
useAdmate({
  row: {
    // 可以在这里提供表单数据的默认值，新增时会有用
    data: {},

    // 在查看、编辑单条记录时，可能需要调用接口回显单条记录的数据
    // dataAt用于指定接口返回值中单条记录数据所在的位置
    // 支持属性名如'data'，属性路径如'data.records'
    // 还支持function，如response => response.data
    dataAt: undefined,

    // 将接口返回值与默认值合并的方式
    // 可选值：
    // 'shallow': 浅合并（默认）
    // 'deep': 深合并
    // false: 不合并，直接替换
    mergeData: 'shallow',
  },
})
```

<br>

### 表单形态

`row.status`

可能的值：

- `'c'` 新增
- `'r'` 查看
- `'u'` 编辑
- `''` 关闭

<br>

### 查看

```ts
const {
  /**
   * @param {any} [payload]
   * @param {'data'|'params'|'config'|'cache'} [payloadUse] 指定payload的用途
   */
  r
} = useAdmate()
```

**参数2的可选值：**

- `'data'`：将payload用作请求配置的 `data` 参数（请求方式为POST/PATCH/PUT/DELETE时默认）
- `'params'`：将payload用作请求配置的 `params` 参数（请求方式为GET/HEAD时默认）
- `'config'`：将payload仅用于构建请求配置（详见[RESTful](#RESTful)）
- `'cache'`：将payload直接用作表单数据（不调用查询单条记录的接口）

<br>

### 新增

打开表单，提交时会调用 `axiosConfig.c`

```ts
const { c } = useAdmate()
```

<br>

### 编辑

打开表单，提交时会调用 `axiosConfig.u`

```ts
const {
  /**
   * @param {any} [payload]
   * @param {string} ['data'|'params'|'config'|'cache'] 指定payload的用途
   */
  u
} = useAdmate()
```

**参数2的可选值：**

- `'data'`：将payload用作请求配置的 `data` 参数（请求方式为POST/PATCH/PUT/DELETE时默认）
- `'params'`：将payload用作请求配置的 `params` 参数（请求方式为GET/HEAD时默认）
- `'config'`：将payload仅用于构建请求配置（详见[RESTful](#RESTful)）
- `'cache'`：将payload直接用作表单数据（不调用查询单条记录的接口）

<br>

### 删除

```ts
const {
  /**
   * @param {any} [payload]
   * @param {'data'|'params'|'config'} [payloadUse] 指定payload的用途
   */
  d
} = useAdmate()
```

**参数2的可选值：**

- `'data'`：将payload用作请求配置的 `data` 参数（请求方式为POST/PATCH/PUT/DELETE时默认）
- `'params'`：将payload用作请求配置的 `params` 参数（请求方式为GET/HEAD时默认）
- `'config'`：将payload仅用于构建请求配置（详见[RESTful](#RESTful)）

<br>

### 启用

```ts
const {
  /**
   * @param {any} [payload]
   * @param {string} ['data'|'params'|'config'] 指定payload的用途
   */
  enable
} = useAdmate()
```

**参数2的可选值：**

- `'data'`：将payload用作请求配置的 `data` 参数（请求方式为POST/PATCH/PUT/DELETE时默认）
- `'params'`：将payload用作请求配置的 `params` 参数（请求方式为GET/HEAD时默认）
- `'config'`：将payload仅用于构建请求配置（详见[RESTful](#RESTful)）

<br>

### 停用

```ts
const {
  /**
   * @param {any} [payload]
   * @param {string} ['data'|'params'|'config'] 指定payload的用途
   */
  disable
} = useAdmate()
```

**参数2的可选值：**

- `'data'`：将payload用作请求配置的 `data` 参数（请求方式为POST/PATCH/PUT/DELETE时默认）
- `'params'`：将payload用作请求配置的 `params` 参数（请求方式为GET/HEAD时默认）
- `'config'`：将payload仅用于构建请求配置（详见[RESTful](#RESTful)）

<br>

### 变更状态

```ts
const {
  /**
   * @param {any} [payload]
   * @param {string} ['data'|'params'|'config'] 指定payload的用途
   */
  updateStatus
} = useAdmate()
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
    <el-switch
      @change="updateStatus({id,status:status^1})"
    />
  </template>
</el-table-column>
```

- 启用和停用是独立的两个接口：使用 `enable` 和 `disable`

```html

<el-table-column label="操作" align="center">
  <template slot-scope="{row:{id,status}}">
    <el-switch
      @change="[enable,disable][status]({id})"
    />
  </template>
</el-table-column>
```

<br>

### Hook: 打开表单后

```ts
const { r, u } = useAdmate()

r().then(response => {
  // response为axiosConfig.r的接口返回值
  // 修改表单数据
  row.value.data.status = 1
})

u().then(response => {
  // response为axiosConfig.r的接口返回值
  // 修改表单数据
  row.value.data.status = 1
})
```

<br>

### Hook: 提交表单时

`submit` ：提交表单，新增时调用 `axiosConfig.c`，编辑时调用 `axiosConfig.u`

`submitProxy`：你可以使用 `submitProxy` 来代理 `submit`，以便在submit前后做一些操作，或改变submit的行为

```ts
const {
  /**
   * @param {any} [params = row.value.data] - 接口参数
   * @returns {Promise<any>} 接口返回值
   */
  submit
} = useAdmate()
```

```ts
// 示例：指定提交参数

submit({
  ...row.value.data,
  status: 1,
})

// submit被代理时
useAdmate({
  submitProxy (submit) {
    submit({
      ...row.value.data,
      status: 1,
    })
  }
})
```

```ts
// 示例：提交前校验表单

useAdmate({
  submitProxy (submit) {
    return new Promise((resolve, reject) => {
      rowDataFormRef.value.validate().then(() => {
        submit().then(() => {
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
// 示例：提交表单后，自定义表单的开闭和加载状态

// return a promise
useAdmate({
  submitProxy (submit) {
    return new Promise((resolve, reject) => {
      rowDataFormRef.value.validate().then(() => {
        submit().then(() => {
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

// return an object
useAdmate({
  submitProxy (submit) {
    return {
      show: false,
      submitting: false,
    }
  }
})
```

<br>

## 例：嵌套另一个使用Admate的页面

```vue
<!-- 示例：父页面中某个对话框要展示一个同样使用Admate的页面 -->

<template>
  <div class="p-20px">
    <el-table v-loading="list.loading" :data="list.data">
      <!-- -->
      <el-table-column label="操作" align="center">
        <template slot-scope="{ row }">
          <el-button
            @click="subpageShow(row)"
          >
            查看子页面
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="SubPage.show">
      <SubPage v-if="SubPage.data.id" :id="SubPage.data.id"/>
    </el-dialog>
  </div>
</template>

<script>
import useAdmate from 'admate'
import SubPage from './SubPage'

export default {
  setup: () => useAdmate({
    urlPrefix: 'somepage',
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
```

```vue
<!-- 子页面 -->

<template>
  <div class="p-20px">
    <el-table v-loading="list.loading" :data="list.data">
      <!-- -->
    </el-table>
  </div>
</template>

<script>
import useAdmate from 'admate'

export default {
  setup: (props, { attrs }) => useAdmate({
    list: {
      filter: {
        id: attrs.id // 用父页面传过来的id作为初始参数
      }
    },
  }),
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
    <el-dialog
      v-model="row.show"
      :show-close="false"
      :modal="false"
      class="relative"
    >
      <div slot="footer" class="text-right pt-50px">
        <el-button
          type="primary"
          @click="submit"
          :loading="row.submitting"
        >
          保 存
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import useAdmate from 'admate'

export default {
  setup: () => {
    const admate = useAdmate({
      getListProxy (getList, caller) {
        if (caller === 'init') {
          admate.u()
        } else {
          admate.currentInstance.value.$message.success('操作成功').then(() => {
            admate.u()
          })
        }
      }
    })

    return admate
  }
}
</script>
```

<br>
