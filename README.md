# Admate / 管理后台伴侣

`Admate` 的目标是以快速简洁的方式开发管理后台页面

并在此基础上确保灵活可配 避免过度封装（opinionated）

<br>

## Installation

<br>

![NPM](https://nodei.co/npm/admate.png)

### 系统集成

参考管理后台脚手架 `admin-cli`

### 局部引入

1. 安装依赖

```bash
yarn add admate kikimore element-form-verify?
```

- [kikimore](https://github.com/cloydlau/kikimore) : admate 会用到其中的一些组件

- [element-form-verify](https://github.com/a1067111756/vue-verify/tree/master/element-form-verify) : admate
  默认使用该库来以指令方式校验输入，可以不安装该依赖，并在生成的代码模板中全局搜索删除 `verify`

2. 初始化

```js
// @/utils/admate.js

import './admate.css' // todo: 如果你的系统已集成 windicss / tailwind，可删去
import Vue from 'vue'
import { mapGetters } from 'vuex'
import request from '@/utils/request'

/**
 * 全局注册指令表单校验
 */
import ElementFormVerify from 'element-form-verify'
Vue.use(ElementFormVerify)

/**
 * mixins
 */
import { CancelToken } from 'axios'
import { getMixins } from 'admate'
let mixins = getMixins({
  getListProxy (motive) {
    this.getList__()
    if (['c', 'u', 'd', 'updateStatus', 'enable', 'disable'].includes(motive)) {
      this.$message.success('操作成功')
    }
  },
  CancelToken
})
mixins = {
  ...mixins,
  // mixins补充
  computed: {
    ...mixins.computed,
    ...mapGetters([
      'dict',
    ]),
  }
}
export { mixins }

/**
 * apiGenerator
 */
import { getApiGenerator } from 'admate'
const apiGenerator = getApiGenerator({ request })
export { apiGenerator }

/**
 * axiosShortcut
 */
import { getAxiosShortcut } from 'admate'
const axiosShortcut = getAxiosShortcut({ request })
const $axiosShortcut = Object.keys(axiosShortcut).reduce((total, currentValue) => {
  total[`$${currentValue}`] = axiosShortcut[currentValue]
  return total
}, {})
export { $axiosShortcut }

/**
 * filters
 */
import { filters } from 'admate'
const $filters = Object.keys(filters).reduce((total, currentValue) => {
  total[`$${currentValue}`] = filters[currentValue]
  return total
}, {})
export { $filters }

/**
 * [AuthButton] show属性
 */
import router from '../router'
import store from '../store'
export const showAuthButton = name => {
  let authButtons = store.getters?.authButtons?.[router.currentRoute.path] || []

  // 分解连缀的权限词, 例如: ['启用/停用'] 拆分成: ['启用','停用']
  authButtons.forEach((item, index) => {
    const splitArr = item.split('/')
    if (splitArr.length > 1) {
      authButtons.splice(index, 1)
      splitArr.forEach(key => {
        authButtons.push(key)
      })
    }
  })
  return authButtons.includes(name)
}
```

::: warning  
`showAuthButton` 是判断权限按钮是否显示的逻辑 根据你的系统需求自行修改
:::

```css
/* @/utils/admate.css */
/* 样式补丁，如果如果你的系统已集成 windicss / tailwind，则不需要 */

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

3. 页面使用

```vue
<!-- xxx.vue -->

<template>
  <!-- AuthButton示例 -->
  <AuthButton :show="showAuthButton" name="新增"/>
</template>

<script>
import { mixins, apiGenerator, showAuthButton, $filters, $axiosShortcut } from '@/utils/admate'
import 'kikimore/dist/style.css'
import { FormDialog, AuthButton, Selector, Pagination, FormItemTip, Tag, Swal } from 'kikimore'
const { success, info, warning, error, confirm } = Swal

export default {
  mixins: [mixins],
  components: { FormDialog, AuthButton, Selector, Pagination, FormItemTip, Tag },
  filters: {
    ...$filters
  },
  data () {
    return {
      api__: apiGenerator('xxx'),
      showAuthButton,
    }
  },
  methods: {
    ...$axiosShortcut,
  }
}
</script>
```

<br>

## 搭配代码生成器使用

:one: 在 `VSCode` 插件市场搜索 `yapi2code` 并安装

:two: 打开命令面板（`F1`） 输入 `yapi2code` 运行

<br>

## mixins

页面公共逻辑混入

::: danger  
mixins属于vue2.0时代遗留物 其思想已淘汰 仅作为升级vue3.0之前的临时方案
:::

获取实例：调用 `getMixins()`

`mixins` 集成了一些什么功能？

- 获取列表、增删查改、状态启停用等管理后台页面标配
- 关闭表单对话框时 自动将表单绑定的数据恢复至初始状态（不是直接清空）
- 离开页面时 如果存在未完成的请求 自动终止该请求调用
- 删除当前分页最后一条记录时 自动切换至上一页（如果当前不在第一页）
- 节流控制表格筛选的接口触发频率

  ...

<br>

### 命名规则

::: warning  
`mixins` 中所有的 data、methods 均已**双下划线结尾**命名，以避免与业务代码冲突

为什么 `admate`
没有按照 [Vue官方风格指南](https://cn.vuejs.org/v2/style-guide/#%E7%A7%81%E6%9C%89-property-%E5%90%8D%E5%BF%85%E8%A6%81)
中指导的以 `$_yourPluginName_` 开头命名？

- `admate` 中含有 data，data 是不允许这样命名的：

  <span style="color:red">[Vue warn]: Property "$_admate_list" must be accessed with "$data.$_admate_list" because
  properties starting with "$" or "_" are not proxied in the Vue instance to prevent conflicts with Vue internals.
  See: https://vuejs.org/v2/api/#data</span>
  :::

<br>

### 初始化

```js
// main.js

import Vue from 'vue'
import { CancelToken } from 'axios'
import { getMixins } from 'admate'

let mixins = getMixins({
  // 全局配置

  //  接口参数、返回值格式定制化
  props: {
    // [列表查询接口] 页码字段名
    pageNo: 'pageNo',

    // [列表查询接口] 页容量字段名
    pageSize: 'pageSize',

    // [列表查询接口] 返回值中列表字段所在位置
    // 考虑到分页与不分页的返回格式可能是不同的 所以支持传入一个数组 数组会被遍历 直到找到为止
    list: ['data', 'data.records'],

    // [列表查询接口] 返回值中总记录数字段所在位置
    total: 'data.total',

    // [单条查询接口] 返回值中数据所在位置
    r: 'data'
  },

  // 获取列表代理 详见生命周期-查询列表时
  getListProxy (motive, res) {
    this.getList__()
    if (['c', 'u', 'd', 'updateStatus', 'enable', 'disable'].includes(motive)) {
      this.$message.success('操作成功')
    }
  },

  // 用于切换页面时中断请求
  CancelToken,

})

// 对mixins进行补充 如加入computed
mixins = {
  ...mixins,
  computed: {
    ...mixins.computed,
    ...mapGetters([
      'dict',
    ]),
  }
}

export { mixins }
```

### 局部配置

```js
import { mixins } from '@/main'

export default {
  mixins: [mixins],
  data () {
    return {
      props__: {}, // 注意双下划线结尾
    }
  },
  methods: {
    // 注意双下划线结尾
    getListProxy__ (motive, res) {
      this.getList__()
      if (['c', 'u', 'd', 'updateStatus', 'enable', 'disable'].includes(motive)) {
        this.$message.success('操作成功')
      }
    }
  }
}
```

<br>

### 生命周期

#### 查询单条时

```js
/**
 * @return {Promise} 查询单条接口调用
 */
this.retrieve__()
```

> `retrieve__` 是针对 `FormDialog` 组件的 `retrieve` 属性定制的方法

```vue
<!-- 示例：修改接口返回值 -->

<template>
  <FormDialog :retrieve="retrieve"/>
</template>

<script>
export default {
  methods: {
    retrieve () {
      return this.retrieve__()
      ?.then( // 新增时 retrieve__返回为空 需要判空
        /**
         * @param {object} rowData - 单条数据
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
  <FormDialog :retrieve="retrieve"/>
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

#### 提交表单时

```js
/**
 * @param {function|object|FormData} paramHandler - 提交之前的钩子或指定表单参数
 * @return {Promise} 提交表单接口调用
 */
this.submit__(paramHandler)
```

> `submit__` 是针对 `FormDialog` 组件的 `submit` 属性定制的方法

```vue
<!-- 示例：修改提交参数 -->

<template>
  <FormDialog :submit="submit"/>
</template>

<script>
export default {
  methods: {
    submit () {
      // 在提交之前做点什么（无论表单校验是否通过）...
      return this.submit__(
        () => {
          // 在提交之前做点什么（表单校验通过后）...
          if ('c' === this.row__.status) {
            this.row__.data.status = 1
          }
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
  <FormDialog :submit="submit"/>
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

```vue
<!-- 示例：额外的校验 自行控制表单的关闭 -->

<template>
  <FormDialog :submit="submit"/>
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

#### 查询列表时

`getList__` ：在首次进入页面、列表查询参数改变、单条增删查改后会被调用

`getListProxy__`：你可以在 `methods` 中定义一个 `getListProxy__` 方法来代理 `getList__`

```js
methods: {
  /**
   * @param {string} motive - 调用动机 可能的值：'init' 'pageNoChange' 'filterChange' 'c' 'r' 'u' 'd' 'updateStatus' 'enable' 'disable'
   * @param {object} res - 调用动机的接口返回值（首次进入页面、列表查询参数改变时为空）
   */
  getListProxy__(motive, res)
  {
    // 在查询列表之前做点什么...
    this.getList__()
    .then(res => {
      // 在查询列表之后做点什么...
    })
    .catch(res => {})
    .finally()
  }
}
```

<br>

### 表单状态

`this.row__.status`

可能的值：

- `'c'` 新增
- `'r'` 查看
- `'u'` 编辑
- `''` 关闭

<br>

### 列表参数

```this.list__.filter```

**给列表参数绑定默认值**

```js
data()
{
  return {
    list__: {
      filter: {
        pageSize: 15, // 覆盖默认值10
        status: 1 // 新增的
      }
    }
  }
}
```

::: danger  
如果你的参数筛选项中包含 `el-checkbox` 组件，则必须在 data 中声明其初始值，否则将导致无法正确重置（element-ui 的 bug）
:::

```vue
<!-- 示例 -->

<template>
  <el-form ref="listFilter" :model="list__.filter" inline>
    <el-form-item prop="effect">
      <el-checkbox
        v-model="list__.filter.effect"
        label="生效"
        border
      />
    </el-form-item>
    <el-button @click="()=>{$refs.listFilter.resetFields()}">重置</el-button>
  </el-form>
</template>

<script>
export default {
  data () {
    return {
      list__: {
        filter: {
          effect: null
        }
      }
    }
  },
}
</script>
```

<br>

### 列表加载状态

```this.list__.loading```

```js
methods: {
  xxx()
  {
    this.list__.loading = true
    this.$POST('')
    .finally(() => {
      this.list__.loading = false
    })
  }
}
```

<br>

### 表单数据

```this.row__.data```

**给表单数据绑定默认值**

```js
data()
{
  return {
    row__: {
      data: {
        arr: [],
        num: 100
      }
    },
  }
}
```

<br>

## apiGenerator

根据接口前缀自动生成增删查改接口调用

获取实例：调用 `getApiGenerator` 方法

### 初始化

```js
// main.js

import { getApiGenerator } from 'admate'
import request from '@/utils/request'

const apiGenerator = getApiGenerator({
  // 全局配置

  // axios实例
  request,

  // 接口后缀默认值
  url: {
    c: 'create',                  // 单条新增
    r: 'queryForDetail',          // 单条查询
    u: 'update',                  // 单条编辑
    d: 'delete',                  // 单条删除
    list: 'queryForPage',         // 列表查询
    updateStatus: 'updateStatus', // 单条状态变更
    enable: 'enable',             // 状态启用
    disable: 'enable',            // 状态停用
  },

  // 请求方式 默认全POST
  method: {
    c: 'POST',
    r: 'POST',
    u: 'POST',
    d: 'POST',
    list: 'POST',
    updateStatus: 'POST',
    enable: 'POST',
    disable: 'POST',
  },

  // 提交方式 默认空数组（全json） 可以在这里指定接口使用formData
  formData: ['c', 'u'],

  // 使用config你可以完全自定义每个接口的请求配置 甚至支持function（从而能够拿到data）
  config: {
    c: {},
    r (data) {
      return {}
    },
  }
})

export { apiGenerator }
```

### 局部配置

```js
import { apiGenerator } from '@/main'

export default {
  data () {
    return {
      api__: apiGenerator('/somepage', {
        // 全局配置中的所有配置项均支持局部配置
      })
    }
  }
}
```

### 覆盖统一前缀

如果某个接口的前缀不是 `somepage` 可以在后缀前加斜线

```js
data()
{
  return {
    api__: apiGenerator('/somepage', {
      url: {
        r: '/anotherpage/selectOne',
      },
    })
  }
}
```

将得到：

- `/somepage/create`
- `/somepage/update`
- `/somepage/delete`
- `/somepage/queryForPage`
- `/somepage/updateStatus`
- `/anotherpage/selectOne`

<br>

### 增删查改

#### 查询列表

```js
/**
 * @param {function} callback - 回调函数
 *        {object} res - 接口返回值
 */
this.getList__()
```

#### 查询单条

```js
/**
 * @param {object|FormData} obj - 必传
 * @param {string} objIs - 指定参数1的用途 默认'param'
 */
this.r__()
```

#### 新增单条

```this.c__()```

#### 编辑单条

```js
/**
 * @param {object|FormData} obj - 必传
 * @param {string} objIs - 指定参数1的用途 默认'param'
 */
this.u__()
```

#### 删除单条

```js
/**
 * @param {object|FormData} obj - 必传
 * @param {string} objIs - 指定参数1的用途 默认'param'
 */
this.d__()
```

#### 变更单条状态

```js
/**
 * @param {object|FormData} obj - 必传
 * @param {string} objIs - 指定参数1的用途 默认'param'
 */
this.updateStatus__()
```

#### 启用单条

```js
/**
 * @param {object|FormData} obj - 必传
 * @param {string} objIs - 指定参数1的用途 默认'param'
 */
this.enable__()
```

#### 停用单条

```js
/**
 * @param {object|FormData} obj - 必传
 * @param {string} objIs - 指定参数1的用途 默认'param'
 */
this.disable__()
```

<br>

**参数2的可选值：**

- `'param'`：将参数1用作请求参数（默认）
- `'config'`：将参数1仅用于请求配置
- `'data'`：将参数1直接用作表单数据（不调用查询单条接口）（仅 `r__` 和 `u__` 可用）

<br>

### 单条状态变更

状态变更的两种方式：

- 调用同一个接口，传参指定新的状态：使用 `updateStatus`

```html

<el-table-column label="操作" align="center">
  <template slot-scope="{row:{id,status}}">
    <AuthButton @click="updateStatus__({id,status:status^1})" :name="['启用', '停用'][status]"/>
  </template>
</el-table-column>
```

- 启用和停用是独立的两个接口：使用 `enable` 和 `disable`

```html

<el-table-column label="操作" align="center">
  <template slot-scope="{row:{id,status}}">
    <AuthButton @click="[enable__,disable__][status]({id})" :name="['启用', '停用'][status]"/>
  </template>
</el-table-column>
```

<br>

### 不调用查询单条接口

对于 `r__` 和 `u__` 支持直接使用列表中的单条数据（而不是调用接口）

1. 第一个参数：不再传接口参数 将列表中的行数据直接传入
2. 第二个参数：传 `'data'`

```html

<el-table-column label="操作" align="center">
  <template slot-scope="{row}">
    <AuthButton @click="r__(row,'data')" name="查看"/>
    <AuthButton @click="u__(row,'data')" name="编辑"/>
  </template>
</el-table-column>
```

<br>

### RESTful

如果接口地址需要进行动态拼接

```vue

<template>
  <el-table-column label="操作" align="center">
    <template slot-scope="{row}">
      <AuthButton @click="r__(row,'config')" name="查看"/>
      <AuthButton @click="u__(row,'config')" name="编辑"/>
    </template>
  </el-table-column>
</template>

<script>
export default {
  data () {
    return {
      api__: apiGenerator('/somepage', {

        // 方式1
        url: {
          r: row => 'module/' + row.id,
        },

        // 方式2
        config: {
          r (row) {
            return {
              url: 'module/' + row.id
            }
          },
        }

      })
    }
  }
}
</script>
```

<br>

## axiosShortcut

根据axios实例生成axios实例的调用捷径

通过 `getAxiosShortcut` 方法获取 `axiosShortcut`

<br>

### 初始化

```js
import Vue from 'vue'
import { getAxiosShortcut } from 'admate'
import request from '@/utils/request'

const axiosShortcut = getAxiosShortcut({
  // 全局配置

  // axios实例
  request
})
for (let k in axiosShortcut) {
  Object.defineProperty(Vue.prototype, `$${k}`, {
    value: axiosShortcut[k]
  })
}
```

<br>

### AJAX

快捷方式

- `GET`
- `POST`
- `PATCH`
- `PUT`
- `DELETE`
- `HEAD`

```js
/**
 * @param {string} url - 接口地址
 * @param {object} data - 接口参数
 * @param {object} config - axios配置
 * @return {Promise<object>} 接口返回值
 */
this.$POST()
```

::: tip  
屏蔽了GET和POST请求参数属性不一致的差异

过滤掉参数中无效的值（null | NaN | undefined）

有时候参数所绑定的对象中会存在一些临时属性 而这些属性是不应该提交到后端的 我们约定这些临时变量以双下划线__开头 __开头的属性会被过滤掉
:::

<br>

### 上传

> 请求体类型为 multipart/form-data

```js
/**
 * @param {string} url - 接口地址
 * @param {object} data - 接口参数
 * @param {object} config - axios配置
 * @return {Promise<object>} 接口返回值
 */
this.$POST.upload()
```

::: tip  
示例中的 `POST` 可替换为其他请求方式
:::

<br>

### 下载

**ajax请求方式**

```js
/**
 * @param {string} url - 接口地址
 * @param {object} data - 接口参数
 * @param {object} config - axios配置
 * @return {Promise<object>} 接口返回值
 */
this.$POST.download()
```

::: tip  
示例中的 `POST` 可替换为其他请求方式
:::

**地址栏请求方式**

```js
/**
 * @param {string} url - 接口地址
 * @param {object} data - 接口参数
 * @param {object} config - axios配置
 */
this.$DOWNLOAD()
```

<br>

**给上传/下载添加全局回调**

> 上传/下载本质上还是调用axios实例 所以在axios实例的响应拦截器中判断即可

```js
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

## filters

管理后台常用filters

::: tip  
所有过滤器均可当作方法调用
:::

### 初始化

```js
import { filters } from 'admate'
Object.keys(filters).map(filter => {
  const key = `$${filter}`
  Vue.filter(key, filters[filter])
  Object.defineProperty(Vue.prototype, key, {
    value: filters[filter]
  })
})
```

<br>

### key2label

数据字典转义

```html

<el-table-column>
  <template slot-scope="{row}">
    {{row.type | $key2label(dict.type)}}
  </template>
</el-table-column>
```

当作方法调用：

```js
/**
 * @param {string|Symbol} 需要查询的id
 * @param {array} 由多个`{[id]: '', [name]: ''}`构成的数组
 * @param {string} 自定义id和name对应的属性名 默认为'dataValue/dataName'
 * @return {Any} id对应的name
 */
this.$key2label('1', [
  { dataValue: '1', dataName: 'a' },
  { dataValue: '2', dataName: 'b' },
]) // 'a'

this.$key2label('1', [
  { id: '1', name: 'a' },
  { id: '2', name: 'b' },
], 'id/name') // 'a'
```

<br>

### dialogTitle

表单对话框标题

```html

<FormDialog :title="row__.status | $dialogTitle"/>
```

默认对应关系：

- c：新增
- r：查看
- u：编辑

修改默认值或补充其他：

```html

<FormDialog :title="row__.status | $dialogTitle({ c: '注册' })"/>
```
