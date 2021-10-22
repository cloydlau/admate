# Admate / 管理后台伴侣

`Admate` 的目标是以快速简洁的方式开发管理后台页面，

并在此基础上确保灵活可配，杜绝过度封装。

## Features

- 同时支持 `Vue2` & `Vue3`
- 不限制UI框架，只要技术栈是 `Vue` 和 `axios`，便可以使用
- 同一系统内，CRUD的请求配置通常是相似的，同一模块内，接口前缀通常是一致的，Admate可以帮助你减少冗余代码
- 提供列表、表单CRUD的贴心封装，你不再操心列表的读取状态、表单的读取和提交状态
- 支持监听筛选参数自动刷新列表（节流控制接口调用频率），也支持手动点击查询按钮筛选列表
- 支持表单是对话框的形式，也支持表单是独立页面的形式

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
npm add admate vue@3 axios
```

<br>

### Vue 2

```bash
npm add admate vue@2 axios @vue/composition-api
```

### 初始化

[示例代码](https://github.com/cloydlau/admate/blob/master/demo/useMyAdmate.ts)

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

[示例代码](https://github.com/cloydlau/admate/blob/master/demo/UseUIFramework/ElementPlus.vue)

<br>

### 搭配ElementUI

[示例代码](https://github.com/cloydlau/admate/blob/master/demo/UseUIFramework/ElementUI.vue)

<br>

### 搭配AntDesignVue@2

[示例代码](https://github.com/cloydlau/admate/blob/master/demo/UseUIFramework/AntDesignVue.vue)

<br>

### 搭配AntDesignVue@1

[示例代码](https://github.com/cloydlau/admate/blob/master/demo/UseUIFramework/AntDesignVue1.vue)

<br>

### 搭配Vuetify@3

[Vuetify@3](https://next.vuetifyjs.com/zh-Hans/components/app-bars/) 仍处于Alpha阶段

<br>

### 搭配Vuetify@2

[示例代码](https://github.com/cloydlau/admate/blob/master/demo/UseUIFramework/Vuetify2.vue)

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
    // 新增一条记录（submitForm在新增时调用）
    c: {
      method: 'POST',
    },
    // 查询一条记录（openForm在查看、编辑时调用）
    r: {
      method: 'GET',
    },
    // 编辑一条记录（submitForm在编辑时调用）
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

```ts
// 示例：根据传参动态生成配置，常用于RESTful中
// 动态生成配置时，payloadAs将会失效

useAdmate({
  axiosConfig: {
    // 查询列表
    getList: payload => ({
      method: 'GET',
    }),
    // 新增一条记录（submitForm在新增时调用）
    c: payload => ({
      method: 'POST',
    }),
    // 查询一条记录（openForm在查看、编辑时调用）
    r: payload => ({
      method: 'GET',
    }),
    // 编辑一条记录（submitForm在编辑时调用）
    u: payload => ({
      method: 'PUT',
    }),
    // 删除一条记录
    d: payload => ({
      method: 'DELETE',
    }),
    // 启用一条记录
    enable: payload => ({
      method: 'PUT',
    }),
    // 禁用一条记录
    disable: payload => ({
      method: 'PUT',
    }),
    // 变更一条记录的状态
    updateStatus: payload => ({
      method: 'PUT',
    }),
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
r(form, 'config')
u(form, 'config')
```

<br>

### FormData

axios的data默认以 `application/json` 作为MIME type，如果你需要使用 `multipart/form-data`：

- 全局配置

给你的axios配置 `transformRequest`、`headers['Content-Type']`

- 局部配置

`getList`、`r`、`u`、`d`、`updateStatus`、`enable`、`disable`、`submitForm` 的参数1均支持FormData类型

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
    // 过滤参数并转换为FormData
    // 此处示例为将过滤方法绑定到window.FormData，方便其他地方使用
    FormData.from = data => jsonToFormData(pickDeepBy(data, (v, k) => ![NaN, null, undefined].includes(v)))

    // 直接转换为FormData
    //FormData.from = jsonToFormData

    return {
      ...useAdmate({
        getListProxy (getList, trigger) {
          getList(FormData.from(list.filter))
        },
      }),
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

::: danger  
如果你的参数筛选项中包含 `el-checkbox` 组件，则必须在 data 中声明其初始值，否则将导致无法正确重置（element-ui 的 bug）
:::

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

<br>

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
   * PS：以下为原始getList的函数签名，如果你配置了getListProxy，则以getListProxy为准
   *
   * @param {any} [payload = list.filter]
   * @param {'data'|'params'|'config'} [payloadAs] 指定payload的用途
   * @returns {Promise<any>} 接口返回值
   */
  getList
} = useAdmate()

getList() // 手动查询
```

`getListProxy`：你可以使用 `getListProxy` 来代理 `getList`，以便在getList前后做一些操作，或改变getList的行为

```ts
useAdmate({
  /**
   * @param {Function} getList 被代理的原始getList
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
    if (['c', 'u', 'd', 'updateStatus', 'enable', 'disable'].includes(caller)) {
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
      // response为axiosConfig.getList的接口返回值
      list.data = response.data?.filter(v => !v.disabled)
    })
  },
})
```

<br>

## 表单

<a name="openForm-c"><br></a>

### 新增

打开表单，提交时会调用 `axiosConfig.c`

```ts
const { form, openForm } = useAdmate()

// 将表单形态设置为“新增”，然后打开表单
form.status = 'c'
openForm()
```

<a name="openForm-r"><br></a>

### 查看

打开表单，并调用 `axiosConfig.r` 回显表单内容

```ts
const { form, openForm } = useAdmate()

// 将表单形态设置为“查看”，然后打开表单
form.status = 'r'
/**
 * PS：以下为原始openForm的函数签名，如果你配置了openFormProxy，则以openFormProxy为准
 *
 * @param {any} [payload]
 * @param {'data'|'params'|'config'|'cache'} [payloadAs] 指定payload的用途
 * @param {'shallow'|'deep'|false} [mergeData = 'shallow'] 接口返回值与form.data合并的方式
 * @returns {Promise<any>} axiosConfig.r的返回值
 */
openForm()
```

**payloadAs:**

- `'data'`：将payload用作请求配置的 `data` 参数（请求方式为POST/PATCH/PUT/DELETE时默认）
- `'params'`：将payload用作请求配置的 `params` 参数（请求方式为GET/HEAD时默认）
- `'config'`：将payload仅用于构建请求配置（详见[RESTful](#RESTful)）
- `'cache'`：将payload直接用作表单数据（不调用查询单条记录的接口）

**mergeData:**

- `shallow`: 浅合并（默认）
- `deep`: 深合并
- `false`: 不合并，直接替换

<a name="openForm-u"><br></a>

### 编辑

打开表单，并调用 `axiosConfig.r` 回显表单内容，提交时会调用 `axiosConfig.u`

```ts
const { form, openForm } = useAdmate()

// 将表单形态设置为“编辑”，然后打开表单
form.status = 'u'
/**
 * PS：以下为原始openForm的函数签名，如果你配置了openFormProxy，则以openFormProxy为准
 *
 * @param {any} [payload]
 * @param {'data'|'params'|'config'|'cache'} [payloadAs] 指定payload的用途
 * @param {'shallow'|'deep'|false} [mergeData = 'shallow'] 接口返回值与form.data合并的方式
 * @returns {Promise<any>} axiosConfig.r的返回值
 */
openForm()
```

**payloadAs:**

- `'data'`：将payload用作请求配置的 `data` 参数（请求方式为POST/PATCH/PUT/DELETE时默认）
- `'params'`：将payload用作请求配置的 `params` 参数（请求方式为GET/HEAD时默认）
- `'config'`：将payload仅用于构建请求配置（详见[RESTful](#RESTful)）
- `'cache'`：将payload直接用作表单数据（不调用查询单条记录的接口）

**mergeData:**

- `shallow`: 浅合并（默认）
- `deep`: 深合并
- `false`: 不合并，直接替换

<br>

### 删除

```ts
const {
  /**
   * @param {any} [payload]
   * @param {'data'|'params'|'config'} [payloadAs] 指定payload的用途
   * @returns {Promise<any>} axiosConfig.d的返回值
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
   * @param {'data'|'params'|'config'} [payloadAs] 指定payload的用途
   * @returns {Promise<any>} axiosConfig.enable的返回值
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
   * @param {'data'|'params'|'config'} [payloadAs] 指定payload的用途
   * @returns {Promise<any>} axiosConfig.disable的返回值
   */
  disable
} = useAdmate()
```

**参数2的可选值：**

- `'data'`：将payload用作请求配置的 `data` 参数（请求方式为POST/PATCH/PUT/DELETE时默认）
- `'params'`：将payload用作请求配置的 `params` 参数（请求方式为GET/HEAD时默认）
- `'config'`：将payload仅用于构建请求配置（详见[RESTful](#RESTful)）

<br>

### 状态变更

```ts
const {
  /**
   * @param {any} [payload]
   * @param {'data'|'params'|'config'} [payloadAs] 指定payload的用途
   * @returns {Promise<any>} axiosConfig.updateStatus的返回值
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

### 表单数据

`form.data`

```ts
useAdmate({
  form: {
    // 可以在这里提供表单数据的默认值，新增时会有用
    data: {},

    // 在查看、编辑表单时，可能需要调用接口回显表单的数据
    // dataAt用于指定接口返回值中表单数据所在的位置
    // 支持属性名如'data'，属性路径如'data.records'
    // 还支持function，如response => response.data
    dataAt: undefined,
  },
})
```

<br>

### 表单形态

`form.show`: 表单是否打开

可能的值：

- `false`
- `true`

`form.status`: 表单的形态

可能的值：

- `'c'` 新增
- `'r'` 查看
- `'u'` 编辑
- `''` 关闭

form.show为false时，form.status为''

表单默认是对话框的形式，但也支持[表单是独立页面](#FormDecoupled) 的情况

两种表单形式对比：

- 对话框：体验好，割裂感低，表单的开闭不影响父页面状态
- 独立页面：体验较差，从表单返回父页面时，父页面的状态会丢失，比如列表筛选状态

<br>

### 读取状态

`form.loading`

`axiosConfig.r` 被调用时值为 `true`，否则为 `false`

::: warning  
不能将该值当作表单回显结束的标志，因为复用列表数据时不会调用axiosConfig.r
:::

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

`openFormProxy`：你可以使用 `openFormProxy` 来代理 `openForm`，以便在openForm前后做一些操作，或改变openForm的行为

```ts
useAdmate({
  /**
   * @param {Function} openForm 被代理的原始openForm
   * @returns {Promise<object> | object | void} object为打开表单后form的终态
   */
  openFormProxy (openForm) {},
})
```

<br>

```ts
// 示例：回显表单后，修改表单数据

const { form } = useAdmate({
  openFormProxy (openForm) {
    // 新增时openForm没有返回值
    return openForm()?.then(response => {
      // response为axiosConfig.r的接口返回值
      // 修改表单数据
      form.data.status = 1
    })
  },
})
```

```ts
// 示例：回显表单后，清除校验

useAdmate({
  openFormProxy (openForm) {
    return openForm()?.finally(() => {
      formRef.value.clearValidate()
    })
  },
})
```

```ts
// 示例：回显表单后，自定义表单的开闭和读取状态

// 返回一个promise
useAdmate({
  openFormProxy (openForm) {
    return openForm().then(() => {
      // 回显成功后，默认停止加载
      return {
        loading: false,
      }
    }).catch(() => {
      // 回显失败后，默认关闭表单并停止加载
      return {
        show: false,
        loading: false,
      }
    }).finally(() => {
      // 注意：在finally中return是无效的，无法获取到finally中的返回
    })
  }
})

// 也可以再包装一层promise再返回
useAdmate({
  openFormProxy (openForm) {
    return new Promise((resolve, reject) => {
      // 可以在finally中resolve
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
   * PS：以下为原始submitForm的函数签名，如果你配置了submitFormProxy，则以submitFormProxy为准
   *
   * @param {any} [payload = form.data]
   * @param {'data'|'params'|'config'} [payloadAs] 指定payload的用途
   * @returns {Promise<any>} 接口返回值
   */
  submitForm
} = useAdmate()
```

`submitFormProxy`：你可以使用 `submitFormProxy` 来代理 `submitForm`，以便在submitForm前后做一些操作，或改变submitForm的行为

```ts
useAdmate({
  /**
   * @param {Function} submitForm 被代理的原始submitForm
   * @returns {Promise<object> | object | void} object为提交表单后form的终态
   */
  submitFormProxy (submitForm) {}
})
```

<br>

```ts
// 示例：指定提交参数

submitForm({
  ...form.data,
  status: 1,
})

// submitForm被代理时
useAdmate({
  submitFormProxy (submitForm) {
    return submitForm({
      ...form.data,
      status: 1,
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

// 返回一个promise
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

[示例代码](https://github.com/cloydlau/admate/blob/master/demo/examples/FormExternalized.vue)

<a name="FormDecoupled"><br></a>

## 示例：表单是独立页面

操作单条记录时，跳转到专用的表单页面，操作完毕后返回

[示例代码](https://github.com/cloydlau/admate/blob/master/demo/examples/FormDecoupled.vue)

<br>

## 示例：只有表单没有列表

表单默认打开，且无法关闭，通常用于列表中只有一条数据，故列表被省略的场景

[示例代码](https://github.com/cloydlau/admate/blob/master/demo/examples/FormOnly.vue)

<br>

## 示例：嵌套使用

嵌套其它也使用Admate的页面

[示例代码](https://github.com/cloydlau/admate/blob/master/demo/examples/Nested.vue)

<br>
