# Admate / 管理后台伴侣

`Admate` 的目标是以快速简洁的方式开发管理后台页面，

并在此基础上确保灵活可配，杜绝过度封装。

## Features

- 同时支持Vue2 & Vue3
- 不限制UI框架，只要技术栈是Vue和axios，便可以使用
- 提供列表、单条记录CRUD的贴心封装
- 提供接口调用捷径（含上传、下载）
- 节流控制筛选列表的接口调用频率（监听筛选参数时）

周全的收尾工作，没有“后顾之忧”：

- 关闭表单时，自动将表单绑定的数据恢复至初始状态（不是直接清空）
- 删除当前分页最后一条记录时，自动切换至上一页（如果当前不在第一页）
- 离开页面时，自动终止尚未完成的请求

<br>

## 过往版本的文档

<a href="https://www.npmjs.com/package/admate/v/0.6.0-alpha.0">https://www.npmjs.com/package/admate/v/0.5.4</a>

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

### 搭配AntDesignVue@2.x

[示例代码](https://github.com/cloydlau/admate/blob/vue3/demo/UseUIFramework/AntDesignVue.vue)

<br>

### 搭配AntDesignVue@1.x

[示例代码](https://github.com/cloydlau/admate/blob/vue3/demo/UseUIFramework/AntDesignVue2.vue)

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
// 赋默认值

useAdmate({
  list: {
    filter: {
      pageSize: 15,
      status: 1,
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

`list.loading`

```ts
export default {
  methods: {
    xxx () {
      this.list.loading = true
      this.$POST('')
      .finally(() => {
        this.list.loading = false
      })
    }
  }
}
```

<a name="query-table"><br></a>

### Hook: 查询列表时

`getList` ：获取列表，在首次进入页面、查询列表参数改变、单条记录增删查改后会被调用

`getListProxy`：你可以用 `getListProxy` 来代理 `getList`

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
    .catch(res => {})
    .finally()
  },
})
```

<br>

## 表单

### 数据对象

`row.data`

```ts
// 绑定默认值
// 默认值主要用于表单新增时，查看/编辑时，默认值将与接口返回值进行浅混入（Spread Syntax）

useAdmate({
  row: {
    data: {
      arr: [],
      num: 100
    }
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

### Hook: 打开表单时

```ts
/**
 * 为FormDialog组件retrieve属性定制的方法
 * @returns {Promise<any>}
 */
this.retrieve
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
      return this.retrieve()
      ?.then( // 新增时 retrieve返回为空 需要判空
        /**
         * @param {object} rowData - 单条记录数据
         */
        rowData => {
          this.row.data.status = 1
        }
      )
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
this.submit
```

```ts
<!-- 示例：指定提交参数 -->

submit({
  ...row.data,
  status: 1,
})

// submit被代理
useAdmate({
  submitProxy (submit) {
    return new Promise((resolve, reject) => {
      rowDataFormRef.value.$refs.elForm.validate().then(async () => {
        const [res, err] = await waitFor(submit({
          ...row.data,
          status: 1,
        }))
        err ? reject() : resolve()
      })
    })
  }
})
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
getList
```

<br>

### 查询单条记录

```ts
/**
 * @param {any} [payload]
 * @param {string} [payloadUse] 指定payload的用途
 */
r
```

**参数2的可选值：**

- `'data'`：将payload用作请求配置的 `data` 参数（请求方式为POST/PATCH/PUT/DELETE时默认）
- `'params'`：将payload用作请求配置的 `params` 参数（请求方式为GET/HEAD时默认）
- `'config'`：将payload仅用于构建请求配置（详见[RESTful](#RESTful)）
- `'cache'`：将payload直接用作表单数据（不调用查询单条记录的接口）

<br>

### 新增单条记录

`c`

<br>

### 编辑单条记录

```ts
/**
 * @param {any} [payload]
 * @param {string} [payloadUse] 指定payload的用途
 */
u
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
d
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
enable
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
disable
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
updateStatus
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
      @change="updateStatus({id,status:status^1})"
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
      @change="[enable,disable][status]({id})"
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
        @click="r(row,'config')"
      >
        查看
      </KiPopButton>
      <KiPopButton
        v-if="pageBtnList.includes('编辑')"
        type="primary"
        icon="el-icon-edit"
        @click="u(row,'config')"
      >
        编辑
      </KiPopButton>
    </template>
  </el-table-column>
</template>

<script setup>
import useMyAdmate from '@/utils/useMyAdmate'

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
  axiosConfig: {
    r: config => ({
      url: 'module/' + config.id
    }),
  }
})
</script>
```

<br>

## FormData

axios的data默认以application/json作为MIME type，如果你需要使用 `multipart/form-data`：

- 全局配置

给你的axios配置 `transformRequest`、`headers['Content-Type']`

- 局部配置

`r`、`u`、`d`、`updateStatus`、`enable`、`disable` 的payload参数均支持FormData类型。

```vue
<!-- 示例：局部配置 -->

<template>
  <el-table-column label="操作" align="center">
    <template slot-scope="{row:{id}}">
      <KiPopButton
        v-if="pageBtnList.includes('编辑')"
        type="primary"
        icon="el-icon-edit"
        @click="u(FormData.from({id}))"
      >
        编辑
      </KiPopButton>
    </template>
  </el-table-column>

  <KiFormDialog
    :show.sync="row.show"
    :title="row.status | $dialogTitle"
    v-model="row.data"
    :retrieve="retrieve"
    :submit="submit(FormData.from(row.data))"
    :readonly="row.status==='r'"
  >
    <template #el-form>
      <!-- 表单项 -->
    </template>
  </KiFormDialog>
</template>

<script setup>
import useMyAdmate from '@/utils/useMyAdmate'
import { jsonToFormData, pickDeepBy } from 'kayran'

// 过滤参数并转换为FormData
FormData.from = data => jsonToFormData(pickDeepBy(data, (v, k) =>
  ![NaN, null, undefined].includes(v) &&
  !k.startsWith('')
))

// 直接转换为FormData
//FormData.from = jsonToFormData

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
  getListProxy (motive) {
    getList(FormData.from(list.filter))
    if (['c', 'u', 'd', 'updateStatus', 'enable', 'disable'].includes(motive)) {
      $Swal.success('操作成功')
    }
  },
})
</script>
```

<br>

## URL前缀不统一

APIGenerator以统一的URL前缀生成接口调用，当然，也可以不统一：

```ts
// 示例

useAdmate({
  urlPrefix: 'somepage',
  axiosConfig: {
    r: {
      // 如果某个接口的前缀不是'somepage'，可以在URL前面加斜线，即可忽略该前缀。
      url: '/anotherpage/selectOne',
    },
  }
})
```

<br>

## 例：嵌套另一个使用Admate的页面

```vue
<!-- 示例：父页面中某个弹框要展示一个同样使用Admate的页面 -->

<template>
  <div class="p-20px">
    <el-table v-loading="list.loading" :data="list.data">
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
      api: apiGenerator('somepage'),
      subpage: {
        show: false,
        data: {},
      },
    }
  },
  methods: {
    subpageShow (data) {
      subpage.data = {
        ...subpage.data,
        ...data,
      }
      subpage.show = true
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
import { apiGenerator, mixins } from '@/utils/admate'

export default {
  mixins: [mixins],
  data () {
    return {
      api: apiGenerator('subpage'),
      list: {
        filter: {
          id: $attrs.id // 用父页面传过来的id作为初始参数
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
      :show.sync="row.show"
      :title="row.status | $dialogTitle"
      v-model="row.data"
      :retrieve="retrieve"
      :submit="submit"
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
    formDialog = $refs.formDialog
  },
  data () {
    return {
      api: apiGenerator(''),
      formDialog: {},
    }
  },
  methods: {
    getListProxy (motive) {
      if (motive === 'init') {
        u()
      } else {
        $Swal.success('操作成功').then(() => {
          u()
        })
      }
    }
  }
}
</script>
```

<br>

## 接口调用捷径

### AJAX

```ts
/**
 * 快捷方式
 * @param {string} url 接口地址
 * @param {object} data 接口参数（GET/HEAD请求默认使用params）
 * @param {object} config axios配置
 * @returns {Promise<any>} 接口返回
 */
$POST
$GET
$PATCH
$PUT
$DELETE
$HEAD
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
$POST.upload // 请求方式可以更换
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
$GET.download // 请求方式可以更换
```

**HTTP请求**

```ts
/**
 * @param {string} url 接口地址
 * @param {object} params 接口参数
 * @param {object} config axios配置
 */
$DOWNLOAD
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
