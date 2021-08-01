# Admate / 管理后台伴侣

`Admate` 的目标是以快速简洁的方式开发管理后台页面

并在此基础上确保灵活可配 避免过度封装（opinionated）

## Features

- 查询列表、增删查改、状态启停用等管理后台页面标配。
- 关闭表单对话框时，自动将表单绑定的数据恢复至初始状态（不是直接清空）。
- 离开页面时，如果存在未完成的请求，自动终止该请求调用。
- 删除当前分页最后一条记录时，自动切换至上一页（如果当前不在第一页）。
- 节流控制列表筛选的接口触发频率。

<br>

## Installation

![NPM](https://nodei.co/npm/admate.png)

### 全局注册

```ts
// @/utils/admate.ts

import Vue from 'vue'
import { mapGetters } from 'vuex'
import { merge } from 'lodash'
import ElementVerify from 'element-verify'
import { createMixin, createApiGenerator, createAxiosShortcut, filters } from 'admate'
import 'kikimore/dist/style.css'
import { FormDialog, PopButton, PopSwitch, Selector, Pagination, FormItemTip, Swal } from 'kikimore'
import TimeRangePicker from 'time-range-picker'
import request from '@/utils/request'
import { getPageBtnList } from '@/permission'

/**
 * 全局注册kikimore
 */
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

/**
 * 初始化mixin并导出
 */
const mixin = createMixin({
  getListProxy (motive) {
    this.getList__()
    if (['c', 'u', 'd', 'updateStatus', 'enable', 'disable'].includes(motive)) {
      this.$Swal.success('操作成功')
    }
  },
})
const mininData = mixin.data()
const mixins = merge(mixin, {
  /**
   * 补充mixin
   */
  data () {
    return merge(mininData, {
      pageBtnList: getPageBtnList(),
      options: {
        status: ['停用', '启用'],
      },
      popSwitchProps: status => ({
        value: status,
        elTooltipProps: { content: `已${this.options.status[status]}` },
        ...this.pageBtnList.includes(this.options.status[status ^ 1]) ?
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
 * 初始化apiGenerator并导出
 */
const apiGenerator = createApiGenerator(
  /**
   * 全局配置
   */
   
  // axios或axios实例
  request,
  
  // crud接口的axios配置 
  {
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
    list: {
      url: 'queryForPage',
      method: 'POST',
    },
    updateStatus: {
      url: 'updateStatus',
      method: 'POST',
    },
  }
)
export { apiGenerator }

/**
 * 全局注册axiosShortcut
 */
const axiosShortcut = createAxiosShortcut({ request })
for (let k in axiosShortcut) {
  Object.defineProperty(Vue.prototype, `$${k}`, {
    value: axiosShortcut[k]
  })
}

/**
 * 全局注册filters
 */
Object.keys(filters).map(filter => {
  const key = `$${filter}`
  Vue.filter(key, filters[filter])
  Object.defineProperty(Vue.prototype, key, {
    value: filters[filter]
  })
})

/**
 * 全局注册element-verify
 */
Vue.use(ElementVerify)
```

<br>

### 局部配置

#### mixin

```ts
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
        this.$Swal.success('操作成功')
      }
    }
  }
}
```

#### apiGenerator

```ts
import { apiGenerator } from '@/utils/admate'

export default {
  data () {
    return {
      /**
       * @param {string} - 接口模块前缀
       * @param {object} - crud的请求配置（同全局配置）
       */
      api__: apiGenerator('/somepage', {
        r: {
          method: 'POST'
        },
      })
    }
  }
}
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
import { mapGetters } from 'vuex'
import { merge } from 'lodash'
import ElementVerify from 'element-verify'
import { createMixin, createApiGenerator, createAxiosShortcut, filters } from 'admate'
import 'kikimore/dist/style.css'
import { Swal } from 'kikimore'
import request from '@/utils/request'
import { getPageBtnList } from '@/permission'

/**
 * 初始化mixin并导出
 */
const mixin = createMixin({
  /**
   * 全局配置
   */

  // 接口参数、返回值格式定制化
  props: {
    // [查询列表接口] 页码字段名
    pageNo: 'pageNo',

    // [查询列表接口] 页容量字段名
    pageSize: 'pageSize',

    // [查询列表接口] 返回值中表格字段所在位置
    // 考虑到分页与不分页的返回格式可能是不同的 所以支持传入一个数组 数组会被遍历 直到找到为止
    list: ['data', 'data.records', 'data.list'],

    // [查询列表接口] 返回值中总记录数字段所在位置
    total: 'data.total',

    // [单条查询接口] 返回值中数据所在位置
    r: 'data'
  },

  // 查询列表代理
  getListProxy (motive, res) {
    this.getList__()
    if (['c', 'u', 'd', 'updateStatus', 'enable', 'disable'].includes(motive)) {
      Swal.success('操作成功')
    }
  },
})
const mininData = mixin.data()
const mixins = merge(mixin, {
  /**
   * 补充mixin
   */
  data () {
    return merge(mininData, {
      pageBtnList: getPageBtnList(),
      options: {
        status: ['停用', '启用'],
      },
      popSwitchProps: status => ({
        value: status,
        elTooltipProps: { content: `已${this.options.status[status]}` },
        ...this.pageBtnList.includes(this.options.status[status ^ 1]) ?
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
 * 初始化apiGenerator并导出
 */
const apiGenerator = createApiGenerator(
  /**
   * 全局配置
   */
   
  // axios或axios实例
  request,
  
  // crud接口的axios配置 
  {
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
    list: {
      url: 'queryForPage',
      method: 'POST',
    },
    updateStatus: {
      url: 'updateStatus',
      method: 'POST',
    },
  }
)
export { apiGenerator }

/**
 * 初始化axiosShortcut并导出
 */
import { createAxiosShortcut } from 'admate'
const axiosShortcut = createAxiosShortcut(
  // axios或axios实例
  request,
)
const $axiosShortcut = Object.keys(axiosShortcut).reduce((total, currentValue) => {
  total[`$${currentValue}`] = axiosShortcut[currentValue]
  return total
}, {})
export { $axiosShortcut }

/**
 * 导出filters
 */
import { filters } from 'admate'
const $filters = Object.keys(filters).reduce((total, currentValue) => {
  total[`$${currentValue}`] = filters[currentValue]
  return total
}, {})
export { $filters }

/**
 * 全局注册element-verify
 */
Vue.use(ElementVerify)
```

`getListProxy` 详细用法见[Hook: 查询列表时](#query-table)

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

```scss
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

export default {
  mixins: [mixins],
  components: { FormDialog, PopButton, PopSwitch, Selector, Pagination, FormItemTip },
  filters: {
    ...$filters
  },
  data () {
    return {
      api__: apiGenerator('xxx'),
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

:one: 访问YApi，选中相应模块的 `查询列表` 接口

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

#### 覆盖统一前缀

```ts
import { apiGenerator } from '@/utils/admate'

export default {
  data () {
    return {
      api__: apiGenerator('somepage', {
        r: {
          // 如果某个接口的前缀不是'somepage'，可以在url前面加斜线，忽略该前缀。
          url: '/anotherpage/selectOne',
        },
      })
    }
  }
}
```

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

`getList__` ：在首次进入页面、查询列表参数改变、单条增删查改后会被调用

`getListProxy__`：你可以在 `methods` 中定义一个 `getListProxy__` 方法来代理 `getList__`

```ts
methods: {
  /**
   * @param {string} motive 调用动机 可能的值：'init' 'pageNoChange' 'filterChange' 'c' 'r' 'u' 'd' 'updateStatus' 'enable' 'disable'
   * @param {object} res 调用动机的接口返回值（首次进入页面、查询列表参数改变时为空）
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
 * 为FormDialog组件retrieve属性定制的方法
 * @returns {Promise<any>}
 */
this.retrieve__
```

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

### Hook: 提交表单时

```ts
/**
 * 为FormDialog组件submit属性定制的方法
 * @param {any} 提交前的钩子函数或指定表单参数
 * @returns {Promise} 提交表单接口调用
 */
this.submit__
```

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

### 查询列表

```ts
/**
 * @returns {Promise<any>} 接口返回值
 */
this.getList__
```

<br>

### 查询单条

```ts
/**
 * @param {any} [payload] - 接口参数
 * @param {string} [payloadUse=data] - 指定payload的用途
 */
this.r__
```

**参数2的可选值：**

- `'data'`：将payload用作请求配置的 `data` 参数（默认）
- `'params'`：将payload用作请求配置的 `params` 参数
- `'config'`：将payload仅用于构建请求配置的参数（详见[RESTful](#RESTful)）
- `'raw'`：将payload直接用作表单数据（不调用查询单条接口）

<br>

### 新增单条

`this.c__`

<br>

### 编辑单条

```ts
/**
 * @param {any} [payload] - 接口参数
 * @param {string} [payloadUse=data] - 指定payload的用途
 */
this.u__
```

**参数2的可选值：**

- `'data'`：将payload用作请求配置的 `data` 参数（默认）
- `'params'`：将payload用作请求配置的 `params` 参数
- `'config'`：将payload仅用于构建请求配置的参数（详见[RESTful](#RESTful)）
- `'raw'`：将payload直接用作表单数据（不调用查询单条接口）

<br>

### 删除单条

```ts
/**
 * @param {any} [payload] - 接口参数
 * @param {string} [payloadUse=data] - 指定payload的用途
 */
this.d__
```

**参数2的可选值：**

- `'data'`：将payload用作请求配置的 `data` 参数（默认）
- `'params'`：将payload用作请求配置的 `params` 参数
- `'config'`：将payload仅用于构建请求配置的参数（详见[RESTful](#RESTful)）

<br>

### 变更单条状态

```ts
/**
 * @param {any} [payload] - 接口参数
 * @param {string} [payloadUse=data] - 指定payload的用途
 */
this.updateStatus__
```

**参数2的可选值：**

- `'data'`：将payload用作请求配置的 `data` 参数（默认）
- `'params'`：将payload用作请求配置的 `params` 参数
- `'config'`：将payload仅用于构建请求配置的参数（详见[RESTful](#RESTful)）

**状态变更的两种方式：**

- 调用同一个接口，传参指定新的状态：使用 `updateStatus`

```html

<el-table-column label="操作" align="center">
  <template slot-scope="{row:{id,status}}">
    <PopSwitch
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
    <PopSwitch
      v-bind="popSwitchProps(status)"
      @change="[enable__,disable__][status]({id})"
    />
  </template>
</el-table-column>
```

<br>

### 启用单条

```ts
/**
 * @param {any} [payload] - 接口参数
 * @param {string} [payloadUse=data] - 指定payload的用途
 */
this.enable__
```

**参数2的可选值：**

- `'data'`：将payload用作请求配置的 `data` 参数（默认）
- `'params'`：将payload用作请求配置的 `params` 参数
- `'config'`：将payload仅用于构建请求配置的参数（详见[RESTful](#RESTful)）

<br>

### 停用单条

```ts
/**
 * @param {any} [payload] - 接口参数
 * @param {string} [payloadUse=data] - 指定payload的用途
 */
this.disable__
```

**参数2的可选值：**

- `'data'`：将payload用作请求配置的 `data` 参数（默认）
- `'params'`：将payload用作请求配置的 `params` 参数
- `'config'`：将payload仅用于构建请求配置的参数（详见[RESTful](#RESTful)）

<a name="RESTful"><br></a>

## RESTful

如果接口地址需要进行动态拼接

```vue
<!-- 示例 -->

<template>
  <el-table-column label="操作" align="center">
    <template slot-scope="{row}">
      <PopButton
        v-if="pageBtnList.includes('查看')"
        :elTooltipProps="{content:'查看'}"
        icon="el-icon-search"
        @click="r__(row,'config')"
      />
      <PopButton
        v-if="pageBtnList.includes('编辑')"
        :elTooltipProps="{content:'编辑'}"
        type="primary"
        icon="el-icon-edit"
        @click="u__(row,'config')"
      />
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

## 接口调用

### AJAX

```ts
/**
 * 快捷方式
 * @param {string} url 接口地址
 * @param {object} data 接口参数（GET请求默认使用params）
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

> 请求体类型为 multipart/form-data

```ts
/**
 * @param {string} url 接口地址
 * @param {object} data 接口参数
 * @param {object} config axios配置
 * @returns {Promise<any>} 接口返回
 */
this.$POST.upload
this.$PATCH.upload
this.$PUT.upload
```

<br>

### 下载

**ajax请求方式**

```ts
/**
 * @param {string} url 接口地址
 * @param {object} data 接口参数
 * @param {object} config axios配置
 * @returns {Promise<any>} 接口返回
 */
this.$GET.download
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
this.$DOWNLOAD
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
 * @returns {any} key所对应的label
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
