# Admate / 管理后台伴侣

`Admate` 的目标是以快速简洁的方式开发管理后台页面

并在此基础上确保灵活可配 避免过度封装（opinionated）

<br>

## Installation

![NPM](https://nodei.co/npm/admate.png)

### 全局注册

参考管理后台脚手架 `admin-cli`

```ts
// @/utils/admate.ts

/**
 * 挂载lodash
 */
import _ from 'lodash'
Object.defineProperty(Vue.prototype, '$lo', {
  value: _
})

/**
 * mixin
 */
import { mapGetters } from 'vuex'
import { CancelToken } from 'axios'
import { createMixin } from 'admate'
import { getPageBtnList } from '@/permission'
const mixin = createMixin({
  getListProxy (motive) {
    this.getList__()
    if (['c', 'u', 'd', 'updateStatus', 'enable', 'disable'].includes(motive)) {
      this.$message.success('操作成功')
    }
  },
  CancelToken
})
const mixins = _.merge(mixin, {
  /**
   * 补充mixin
   */
  data () {
    return _.merge(mixin.data(), {
      pageBtnList: getPageBtnList(),
      options: {
        status: ['停用', '启用'],
      },
      popSwitchProps: status => ({
        value: status,
        elTooltipProps: { content: `已${this.options.status[status]}` },
        ...this.pageBtnList.includes(this.options.status[status]) ?
          {
            elPopconfirmProps: { title: `确认${this.options.status[status ^ 1]}吗？` }
          } :
          {
            disabled: true,
            elPopoverProps: { content: `<i class='el-icon-warning'/> 权限不足` },
          }
      }),
    })
  },
  computed: {
    ...mapGetters([
      'dict',
    ]),
  }
})
export { mixins }

/**
 * apiGenerator
 */
import { createApiGenerator } from 'admate'
const apiGenerator = createApiGenerator({ request })
export { apiGenerator }

/**
 * axiosShortcut
 */
import { createAxiosShortcut } from 'admate'
const axiosShortcut = createAxiosShortcut({ request })
for (let k in axiosShortcut) {
  Object.defineProperty(Vue.prototype, `$${k}`, {
    value: axiosShortcut[k]
  })
}

/**
 * filters
 */
import { filters } from 'admate'
Object.keys(filters).map(filter => {
  const key = `$${filter}`
  Vue.filter(key, filters[filter])
  Object.defineProperty(Vue.prototype, key, {
    value: filters[filter]
  })
})

/**
 * 注册指令表单校验
 */
import ElementVerify from 'element-verify'
Vue.use(ElementVerify)

/**
 * 注册趁手小型组件
 */
import 'kikimore/dist/style.css'
import { FormDialog, PopButton, PopSwitch, Selector, Pagination, FormItemTip, Swal } from 'kikimore'
import TimeRangePicker from 'time-range-picker'
[{
  component: PopButton,
  config: {
    size: 'mini'
  }
}, {
  component: PopSwitch,
  config: {
    activeValue: 1,
    inactiveValue: 0,
  }
}, {
  component: FormDialog,
}, {
  component: Selector,
}, {
  component: Pagination
}, {
  component: FormItemTip,
}, {
  component: TimeRangePicker
}].map(({ component, config }) =>
  Vue.use(component, config)
)
Object.defineProperty(Vue.prototype, '$Swal', {
  value: Swal
})
```

<br>

### 局部引入

1. 安装依赖

```bash
yarn add admate kikimore element-verify?
```

- [Kikimore](https://github.com/cloydlau/kikimore) : Admate会用到其中的一些组件

- `element-verify` : Admate默认使用该库来以指令方式校验输入，可以不安装该依赖，并在生成的代码模板中全局搜索删除 `verify`

2. 初始化

```ts
// @/utils/admate.ts

import './admate.css' // todo: 如果你的系统已集成 windicss / tailwind，可删去
import Vue from 'vue'
import request from '@/utils/request'

/**
 * 全局注册指令表单校验
 */
import ElementVerify from 'element-verify'
Vue.use(ElementVerify)

/**
 * mixin
 */
import { mapGetters } from 'vuex'
import { CancelToken } from 'axios'
import { createMixin } from 'admate'
import { getPageBtnList } from '@/permission'
const mixin = createMixin({
  getListProxy (motive) {
    this.getList__()
    if (['c', 'u', 'd', 'updateStatus', 'enable', 'disable'].includes(motive)) {
      this.$message.success('操作成功')
    }
  },
  CancelToken
})
const mixins = _.merge(mixin, {
  /**
   * 补充mixin
   */
  data () {
    return _.merge(mixin.data(), {
      pageBtnList: getPageBtnList(),
      options: {
        status: ['停用', '启用'],
      },
      popSwitchProps: status => ({
        value: status,
        elTooltipProps: { content: `已${this.options.status[status]}` },
        ...this.pageBtnList.includes(this.options.status[status]) ?
          {
            elPopconfirmProps: { title: `确认${this.options.status[status ^ 1]}吗？` }
          } :
          {
            disabled: true,
            elPopoverProps: { content: `<i class='el-icon-warning'/> 权限不足` },
          }
      }),
    })
  },
  computed: {
    ...mapGetters([
      'dict',
    ]),
  }
})
export { mixins }

/**
 * apiGenerator
 */
import { createApiGenerator } from 'admate'
const apiGenerator = createApiGenerator({ request })
export { apiGenerator }

/**
 * axiosShortcut
 */
import { createAxiosShortcut } from 'admate'
const axiosShortcut = createAxiosShortcut({ request })
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
```

```ts
// @/permission.ts
// 权限按钮显隐逻辑，仅供参考，根据自身需求进行实现。

import router from './router'
import store from './store'

export function getPageBtnList () {
  let authButtons = store.getters?.authButtons?.[router.currentRoute.path]
  // 分解连缀的权限词, 例如: ['启用/停用'] 拆分成: ['启用','停用']
  authButtons?.forEach((item, index) => {
    const splitArr = item.split('/')
    if (splitArr.length > 1) {
      authButtons.splice(index, 1)
      splitArr.forEach(key => {
        authButtons.push(key)
      })
    }
  })
  return authButtons || []
}
```

```css
/* @/utils/admate.css */
/* 样式补丁，如果如果你的系统已集成 windicss / tailwind，则不需要。 */

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

<script>
import { mixins, apiGenerator, $filters, $axiosShortcut } from '@/utils/admate'
import 'kikimore/dist/style.css'
import { FormDialog, PopButton, PopSwitch, Selector, Pagination, FormItemTip, Swal } from 'kikimore'
const { success, info, warning, error, confirm } = Swal
import { getPageBtnList } from '@/permission'

export default {
  mixins: [mixins],
  components: { FormDialog, PopButton, PopSwitch, Selector, Pagination, FormItemTip },
  filters: {
    ...$filters
  },
  data () {
    return {
      api__: apiGenerator('xxx'),
      pageBtnList: getPageBtnList(),
      options: {
        status: ['停用', '启用'],
      },
      popSwitchProps: status => ({
        value: status,
        activeValue: 1,
        inactiveValue: 0,
        elTooltipProps: { content: `已${this.options.status[status]}` },
        ...this.pageBtnList.includes(this.options.status[status]) ?
          {
            elPopconfirmProps: { title: `确认${this.options.status[status ^ 1]}吗？` }
          } :
          {
            disabled: true,
            elPopoverProps: { content: `<i class='el-icon-warning'/> 权限不足` },
          }
      }),
    }
  },
  methods: {
    ...$axiosShortcut,
  }
}
</script>
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

:one: 访问YApi，选中相应模块的 `查询表格` 接口

:two: 点击浏览器右上角运行插件

:three: 点击 `生成代码`，代码将被复制至剪贴板

:four: 创建页面文件 `xxx.vue`，粘贴代码

<br>

## 命名规则

::: warning  
`mixin` 中所有的 data、methods 均已**双下划线结尾**命名，以避免与业务代码冲突

为什么 `Admate`
没有按照 [Vue官方风格指南](https://cn.vuejs.org/v2/style-guide/#%E7%A7%81%E6%9C%89-property-%E5%90%8D%E5%BF%85%E8%A6%81)
中指导的以 `$_yourPluginName_` 开头命名？

- `Admate` 中含有 data，data 是不允许这样命名的：

  <span style="color:red">[Vue warn]: Property "$_admate_list" must be accessed with "$data.$_admate_list" because
  properties starting with "$" or "_" are not proxied in the Vue instance to prevent conflicts with Vue internals.
  See: https://vuejs.org/v2/api/#data</span>
  :::

<br>

## 全局配置

### mixin

页面公共逻辑混入

::: danger  
mixins属于vue2.0时代遗留物 其思想已淘汰 仅作为升级vue3.0之前的临时方案
:::

获取实例：调用 `createMixin()`

`mixin` 集成了一些什么功能？

- 查询表格、增删查改、状态启停用等管理后台页面标配
- 关闭表单对话框时 自动将表单绑定的数据恢复至初始状态（不是直接清空）
- 离开页面时 如果存在未完成的请求 自动终止该请求调用
- 删除当前分页最后一条记录时 自动切换至上一页（如果当前不在第一页）
- 节流控制表格筛选的接口触发频率

  ...

<br>

```ts
// @/utils/admate.ts

import { CancelToken } from 'axios'
import { createMixin } from 'admate'

let mixin = createMixin({
  // 全局配置

  //  接口参数、返回值格式定制化
  props: {
    // [查询表格接口] 页码字段名
    pageNo: 'pageNo',

    // [查询表格接口] 页容量字段名
    pageSize: 'pageSize',

    // [查询表格接口] 返回值中表格字段所在位置
    // 考虑到分页与不分页的返回格式可能是不同的 所以支持传入一个数组 数组会被遍历 直到找到为止
    list: ['data', 'data.records'],

    // [查询表格接口] 返回值中总记录数字段所在位置
    total: 'data.total',

    // [单条查询接口] 返回值中数据所在位置
    r: 'data'
  },

  // 查询表格代理 详见生命周期-查询表格时
  getListProxy (motive, res) {
    this.getList__()
    if (['c', 'u', 'd', 'updateStatus', 'enable', 'disable'].includes(motive)) {
      this.$message.success('操作成功')
    }
  },

  // 用于切换页面时中断请求
  CancelToken,
})
```

<br>

### apiGenerator

根据接口前缀自动生成增删查改接口调用

获取实例：调用 `createApiGenerator` 方法

```ts
// @/utils/admate.ts

import { createApiGenerator } from 'admate'
import request from '@/utils/request'

const apiGenerator = createApiGenerator({
  // 全局配置

  // axios实例
  request,

  // 接口后缀默认值
  url: {
    c: 'create',                  // 单条新增
    r: 'queryForDetail',          // 单条查询
    u: 'update',                  // 单条编辑
    d: 'delete',                  // 单条删除
    list: 'queryForPage',         // 查询表格
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
```

<br>

### axiosShortcut

根据axios实例生成axios实例的调用捷径

通过 `createAxiosShortcut` 方法获取 `axiosShortcut`

```ts
// @/utils/admate.ts

import Vue from 'vue'
import { createAxiosShortcut } from 'admate'
import request from '@/utils/request'

const axiosShortcut = createAxiosShortcut({
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

### filters

管理后台常用filters

::: tip  
所有过滤器均可当作方法调用
:::

```ts
// @/utils/admate.ts

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

## 局部配置

### mixin

```ts
// xxx.vue

import { mixins } from '@/utils/admate'

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

### apiGenerator

```ts
// xxx.vue

import { apiGenerator } from '@/utils/admate.ts'

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

#### 覆盖统一前缀

如果某个接口的前缀不是 `somepage` 可以在后缀前加斜线

```ts
import { apiGenerator } from '@/utils/admate.ts'

export default {
  data () {
    return {
      api__: apiGenerator('/somepage', {
        url: {
          r: '/anotherpage/selectOne',
        },
      })
    }
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

## 表格

### 查询参数

`this.list__.filter`

```ts
// 绑定默认值
// 默认值将被浅混入（Spread Syntax）

export default {
  data () {
    return {
      list__: {
        filter: {
          pageSize: 15, // 覆盖默认值10
          status: 1 // 新增的
        }
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

### 查询校验

给绑定表格参数的el-form添加校验逻辑即可，执行 `getList` 之前会自动进行校验，校验失败则不会执行 `getList`

<br>

### 加载状态

`this.list__.loading`

```ts
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

### Hook: 查询表格时

`getList__` ：在首次进入页面、查询表格参数改变、单条增删查改后会被调用

`getListProxy__`：你可以在 `methods` 中定义一个 `getListProxy__` 方法来代理 `getList__`

```ts
methods: {
  /**
   * @param {string} motive 调用动机 可能的值：'init' 'pageNoChange' 'filterChange' 'c' 'r' 'u' 'd' 'updateStatus' 'enable' 'disable'
   * @param {object} res 调用动机的接口返回值（首次进入页面、查询表格参数改变时为空）
   */
  getListProxy__(motive, res)
  {
    // 在查询表格之前做点什么...
    this.getList__()
    .then(res => {
      // 在查询表格之后做点什么...
    })
    .catch(res => {})
    .finally()
  }
}
```

<br>

## 表单

### 数据对象

`this.row__.data`

```ts
// 绑定默认值
// 默认值主要用于表单新增时，查看/编辑时，默认值将与接口返回值进行浅混入（Spread Syntax）

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

### 提交校验

给绑定表单参数的el-form添加校验逻辑即可

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

<br>

### Hook: 打开表单时

```ts
/**
 * @return {Promise<any>} 查询单条接口调用 参数为接口返回值
 */
this.retrieve__()
```

> `retrieve__` 是为 `FormDialog` 组件 `retrieve` 属性定制的方法

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
         * @param {object} rowData 单条数据
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

### Hook: 提交表单时

```ts
/**
 * @param {function|object|FormData} paramHandler 提交之前的钩子或指定表单参数
 * @return {Promise} 提交表单接口调用
 */
this.submit__(paramHandler)
```

> `submit__` 是为 `FormDialog` 组件 `submit` 属性定制的方法

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
        async () => {
          // 在提交之前做点什么（表单校验通过后）...
          if ('c' === this.row__.status) {
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

<br>

### 特殊页面：无表格，仅含表单

场景：表格中只有一条数据，故表格被省略，默认弹出编辑框

```vue
<!-- 示例 -->

<template>
  <div class="p-20px w-full">
    <FormDialog
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
    </FormDialog>
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

## 增删查改

### 查询表格

```ts
/**
 * @return {Promise<any>} 查询表格接口调用 参数为接口返回值
 */
this.getList__()
```

<br>

### 查询单条

```ts
/**
 * @param {object|FormData} obj?
 * @param {string} objIs 指定参数1的用途 默认'param'
 */
this.r__()
```

#### 不调用查询单条接口

对于 `r__` 和 `u__` 支持直接使用表格中的单条数据（而不是调用接口）

1. 第一个参数：不再传接口参数 将表格中的行数据直接传入
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

### 新增单条

```this.c__()```

<br>

### 编辑单条

```ts
/**
 * @param {object|FormData} obj?
 * @param {string} objIs 指定参数1的用途 默认'param'
 */
this.u__()
```

<br>

### 删除单条

```ts
/**
 * @param {object|FormData} obj?
 * @param {string} objIs 指定参数1的用途 默认'param'
 */
this.d__()
```

<br>

### 变更单条状态

```ts
/**
 * @param {object|FormData} obj?
 * @param {string} objIs 指定参数1的用途 默认'param'
 */
this.updateStatus__()
```

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

### 启用单条

```ts
/**
 * @param {object|FormData} obj?
 * @param {string} objIs 指定参数1的用途 默认'param'
 */
this.enable__()
```

<br>

### 停用单条

```ts
/**
 * @param {object|FormData} obj?
 * @param {string} objIs 指定参数1的用途 默认'param'
 */
this.disable__()
```

**参数2的可选值：**

- `'param'`：将参数1用作请求参数（默认）
- `'config'`：将参数1仅用于请求配置
- `'data'`：将参数1直接用作表单数据（不调用查询单条接口）（仅 `r__` 和 `u__` 可用）

<br>

## RESTful

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

## 接口调用

### AJAX

快捷方式

- `GET`
- `POST`
- `PATCH`
- `PUT`
- `DELETE`
- `HEAD`

```ts
/**
 * @param {string} url 接口地址
 * @param {object} data 接口参数
 * @param {object} config axios配置
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

```ts
/**
 * @param {string} url 接口地址
 * @param {object} data 接口参数
 * @param {object} config axios配置
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

```ts
/**
 * @param {string} url 接口地址
 * @param {object} data 接口参数
 * @param {object} config axios配置
 * @return {Promise<object>} 接口返回值
 */
this.$POST.download()
```

::: tip  
示例中的 `POST` 可替换为其他请求方式
:::

**地址栏请求方式**

```ts
/**
 * @param {string} url 接口地址
 * @param {object} data 接口参数
 * @param {object} config axios配置
 */
this.$DOWNLOAD()
```

<br>

**给上传/下载添加全局回调**

> 上传/下载本质上还是调用axios实例 所以在axios实例的响应拦截器中判断即可

```ts
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

## 数据字典转义

key2label

```html

<el-table-column>
  <template slot-scope="{row}">
    {{row.type | $key2label(dict.type)}}
  </template>
</el-table-column>
```

当作方法调用：

```ts
/**
 * @param {any} 需要查询的key
 * @param {object[]} 数据字典数组
 * @param {object} 配置选项，自定义key和label对应的属性名 默认值为 { key: 'dataValue', label: 'dataName' }
 * @return {any} key所对应的label
 */
this.$key2label('1', [
  { dataValue: '1', dataName: 'a' },
  { dataValue: '2', dataName: 'b' },
]) // 'a'

this.$key2label('1', [
  { id: '1', name: 'a' },
  { id: '2', name: 'b' },
], {
  key: 'id',
  label: 'name'
}) // 'a'
```

<br>
