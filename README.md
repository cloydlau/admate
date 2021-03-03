# admate / 管理后台伴侣

管理后台伴侣的目标是以最快最简洁的方式开发管理后台页面

并在此基础上确保灵活可配 避免过度封装

<br/>

## Installation

<br/>

![NPM](https://nodei.co/npm/admate.png)

``` bash
$ yarn add admate
```

## mixins

页面公共逻辑混入

通过 `getMixins` 方法获取 `mixins`

`mixins` 集成了一些什么功能？

- 获取列表、增删查改、状态启停用等管理后台页面标配
- 关闭表单对话框时 自动将表单绑定的数据恢复至初始状态（不是直接清空）
- 切换到下一个页面时如果存在未完成的请求 自动终止该请求调用
- 删除当前分页最后一条记录时 自动切换至上一页（如果当前不在第一页）
- 节流控制表格筛选的接口触发频率

  ...

::: warning  
`mixins` 中所有的 `data` 和 `methods` 均以**双下划线结尾**命名 避免和你的代码冲突
:::

### 初始化

```js
// main.js

import Vue from 'vue'
import { CancelToken } from 'axios'
import { getMixins } from 'admate'
let mixins = getMixins({
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
  onSuccess () {
    Vue.prototype.$message.success('操作成功')
  },
  CancelToken,
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
```

### 局部配置

```js
import { mixins } from '@/main'

export default {
  mixins: [mixins],
  data () {
    return {
      props__: {} // 注意双下划线结尾
    }
  }
}
```

<br/>

## apiGenerator

根据接口前缀自动生成增删查改接口调用

通过 `getApiGenerator` 方法获取 `apiGenerator`

### 初始化

```js
// main.js

import { getApiGenerator } from 'admate'
const apiGenerator = getApiGenerator({ 
  // 如axios实例
  request,

  // 接口后缀默认值
  url: {
    c: 'create',                  // 单条新增
    r: 'queryForDetail',          // 单条查询
    u: 'update',                  // 单条编辑
    d: 'delete',                  // 单条删除
    list: 'queryForPage',         // 列表查询
    updateStatus: 'updateStatus', // 单条状态变更
  },

  // 请求方式 默认全POST
  method: {
    c: 'POST',
    r: 'POST',
    u: 'POST',
    d: 'POST',
    list: 'POST',
    updateStatus: 'POST',
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

::: tip  
如果某个接口的前缀不是somepage，可以在后缀前添加斜线
:::

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

- /somepage/create
- /somepage/update
- /somepage/delete
- /somepage/queryForPage
- /somepage/updateStatus
- **/anotherpage/selectOne**

<br/>

::: tip  
如果想直接使用列表中的单条数据（而不是调用接口）
:::

`r__` 和 `u__`：

1. 第一个参数：不再传接口参数 将列表中的行数据直接传入
2. 第二个参数：传 `'data'` [详细说明](#useFor)

```html

<el-table-column label="操作" align="center">
  <template slot-scope="{row}">
    <AuthButton @click="r__(row,'data')" name="查看"/>
    <AuthButton @click="u__(row,'data')" name="编辑"/>
  </template>
</el-table-column>
```

<br/>

<br/>

## axiosShortcut

根据axios实例生成axios实例的调用捷径

通过 `getAxiosShortcut` 方法获取 `axiosShortcut`

### 初始化

```js
import Vue from 'vue'
import { getAxiosShortcut } from 'admate'
const axiosShortcut = getAxiosShortcut({ request })
for (let k in axiosShortcut) {
  Vue.prototype[k] = axiosShortcut[k]
}
```

<br/>

## filters

管理后台常用filters

::: tip  
所有过滤器均可当作方法调用
:::

### 初始化

```js
import { filters } from 'admate'
Object.keys(filters).map(key => {
  Vue.filter(key, filters[key])
  Object.defineProperty(Vue.prototype, key, {
    value: filters[key]
  })
})
```

### key2label__

数据字典转义

```html
<el-table-column>
  <template slot-scope="{row}">
    {{row.type | key2label__(dict.type)}}
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
this.key2label__('1', [
  { dataValue: '1', dataName: 'a' },
  { dataValue: '2', dataName: 'b' },
]) // 'a'

this.key2label__('1', [
  { id: '1', name: 'a' },
  { id: '2', name: 'b' },
], 'id/name') // 'a'
```

<br/>

### dialogTitle__

表单对话框标题

```html

<FormDialog :title="row__.status | dialogTitle__"/>
```

默认对应关系：

- c：新增
- r：查看
- u：编辑

修改默认值或补充其他：

```html

<FormDialog :title="row__.status | dialogTitle__({ c: '注册' })"/>
```

<br/>

## 生命周期

### 查询单条记录时

dataGetter__(afterRetrieve, beforeRetrieve)

- afterRetrieve

  > 查询单条记录之后

  > 参数：查询单条记录的返回值

  > 你可以在这个钩子中修改单条查询接口的返回值

- beforeRetrieve

  > 查询单条记录之前

  `html
  <FormDialog 
    :dataGetter="() => dataGetter__(
      resData => {
        // 在查询单条记录之后做点什么...
        // 比如将返回值中status的值修改为1：
  
        // 同步修改：
        resData.status = 1
        
        // 异步修改：
        this.$POST().then(res => {
          this.row__.data.status = 1
        })
      },
      () => {
        // 在查询单条记录之前做点什么...
      }
    )"
  />
  `

<br/>

### 提交表单时

submit__(paramHandler)

```html
<!--在新增时增加一个参数示例-->
<FormDialog
  :submit="() => submit__(
    // 参数可以是一个函数或一个对象
    // 函数会在表单校验通过后、接口调用前执行，对象会被用作接口参数
    () => {
      // 在提交之前做点什么...
      if (row__.status === 'c') {
        row__.data.status = 1
      }
    }).then(() => {
      // 在提交之后做点什么...
    }).catch(() => {
      return {
        close: false
      }
    })
  "
/>
```

<br/>

### 查询列表时

init__

> 在页面初始化、查询参数改变、单条增删查改时getList__会被调用

> 你可以在methods中定义一个init__方法来取代getList__

```js
methods: {
  init__(intention, res)
  {
    // intention可能的值：'init' 'pageNoChange' 'filterChange' 'c' 'r' 'u' 'd' 'updateStatus'
    // res：'c' 'r' 'u' 'd' 'updateStatus' 时的接口返回值

    // 在获取列表之前搞点事情...
    this.getList__(res => {
      // 在获取列表之后搞点事情...
      // res为列表接口返回值
    })
  }
}
```

<br/>

## 表单状态

`this.row__.status`

可能的值：

- `'c'` 新增
- `'r'` 查看
- `'u'` 编辑
- `''` 关闭

<br/>

## 初始值定义

```js
data () {
  return {
    // 表单绑定对象
    row__: {
      data: {
        arr: [],
        num: 100
      }
    },
    // 列表过滤参数
    list__: {
      filter: {
        pageSize: 15, // 覆盖默认值10
        status: 1 // 新增的
      }
    }
  }
}
```

<br/>

## 手动刷新列表

```js
this.getList__()
```

<br/>

## 发起请求

快捷方式

- `GET`
- `POST`
- `PATCH`
- `PUT`
- `DELETE`
- `HEAD`

```ts
this.POST(url, data?, config?)
```

::: tip  
屏蔽了GET和POST请求参数属性不一致的差异

过滤掉参数中无效的值（null | NaN | undefined）

有时候参数所绑定的对象中会存在一些临时属性 而这些属性是不应该提交到后端的 我们约定这些临时变量以双下划线__开头 __开头的属性会被过滤掉
:::

<br/>

### 上传

```js
this.POST.upload(url, data ?, config ?)
```

::: tip  
示例中的 `POST` 可替换为其他请求方式
:::

> 请求体类型为 multipart/form-data

<br/>

### 下载

**ajax请求方式**

```js
this.POST.download(url, data ?, config ?)
```

::: tip  
示例中的 `POST` 可替换为其他请求方式
:::

**地址栏请求方式**

```js
this.DOWNLOAD(url, data?, config?)
```

<br/>

**给上传/下载添加全局回调**

> 上传/下载本质上还是调用request 所以在request的响应拦截器中判断即可

```js
request.interceptors.response.use(
  response => {
    // download
    if (response.config.responseType === 'blob') {
      succeed({
        titleText: '导出成功',
        timer: 5000
      })
    }
  },
)
```

<br/>

## RESTful

如果接口是动态拼接式（如RESTful风格）

`r__` `u__` `d__` `updateStatus__` 均支持第二个参数 以指定第一个参数的用途

<a id="useFor"/>

第二个参数的可选值：

- `'param'`：将第一个参数用作请求参数（默认）
- `'data'`：将第一个参数直接用作表单数据（不调用单条查询接口）
- `'config'`：将第一个参数仅用于请求配置

示例

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
