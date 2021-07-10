import { stringify } from 'qs'
import { jsonToFormData, paramFilter } from 'kayran'
import { name } from '../package.json'
const prefix = `[${name}] `

type url = {
  c?: string | ((objForConfig: object) => string),
  r?: string | ((objForConfig: object) => string),
  u?: string | ((objForConfig: object) => string),
  d?: string | ((objForConfig: object) => string),
  list?: string | ((objForConfig: object) => string),
  updateStatus?: string | ((objForConfig: object) => string),
  enable?: string | ((objForConfig: object) => string),
  disable?: string | ((objForConfig: object) => string),
}

type method = {
  c?: string,
  r?: string,
  u?: string,
  d?: string,
  list?: string,
  updateStatus?: string,
  enable?: string,
  disable?: string,
}

type config = {
  c?: object | ((objForConfig: object) => object),
  r?: object | ((objForConfig: object) => object),
  u?: object | ((objForConfig: object) => object),
  d?: object | ((objForConfig: object) => object),
  list?: object | ((objForConfig: object) => object),
  updateStatus?: object | ((objForConfig: object) => object),
  enable?: object | ((objForConfig: object) => object),
  disable?: object | ((objForConfig: object) => object),
}

export default function createApiGenerator ({
  request,
  config,
  url,
  method,
  formData,
}: {
  request: (args: any) => Promise<any>,
  config?: config,
  url?: url,
  method?: method,
  formData?: string[],
}): (module: string, config?: object) => object {
  const globalRequest = request

  const globalConfig = {
    c: {},
    r: {},
    u: {},
    d: {},
    list: {},
    updateStatus: {},
    enable: {},
    disable: {},
    ...config
  }

  const globalUrl = {
    c: 'create',
    r: 'queryForDetail',
    u: 'update',
    d: 'delete',
    list: 'queryForPage',
    updateStatus: 'updateStatus',
    enable: 'enable',
    disable: 'disable',
    ...url,
  }

  const globalMethod = {
    c: 'POST',
    r: 'POST',
    u: 'POST',
    d: 'POST',
    list: 'POST',
    updateStatus: 'POST',
    enable: 'POST',
    disable: 'POST',
    ...method
  }

  const globalFormData = [
    ...formData ? formData : []
  ]

  /**
   * @param {string} module - 接口模块前缀
   * @param {object} url - 默认接口地址混入
   */
  return function apiGenerator (module: string, {
    request,
    config,
    url,
    method,
    formData,
  }: {
    request?: (args: any) => Promise<any>,
    config?: config,
    url?: url,
    method?: method,
    formData?: string[],
  } = {}) {
    // 保证module不为null
    module = module || ''

    request = request || globalRequest
    const instanceConfig = {
      ...globalConfig,
      ...config
    }
    url = {
      ...globalUrl,
      ...url
    }
    method = {
      ...globalMethod,
      ...method
    }
    formData = [
      ...globalFormData ? globalFormData : [],
      ...formData ? formData : []
    ]

    const getUrl = (suffix, objForConfig) =>
      typeof suffix === 'function' ? suffix(objForConfig) :
        suffix.startsWith('/') ? suffix : (module.endsWith('/') ? module : module + '/') + suffix

    return {
      c: (obj, objIs = 'param', config) => {
        return request({
          url: getUrl(url.c, obj),
          method: method.c,
          ...objIs === 'param' && {
            data: formData.includes('c') ? jsonToFormData(obj) : obj
          },
          /**
           * config优先级：
           *   1. Admate自身的config
           *   2. 用户的全局配置
           *   3. 用户的局部配置
           *   4. 用户的实例配置
           */
          ...config,
          ...typeof instanceConfig.c === 'function' ? instanceConfig.c(obj) : instanceConfig.c,
          ...objIs === 'config' && obj,
        })
      },
      u: (obj, objIs = 'param', config) => {
        return request({
          url: getUrl(url.u, obj),
          method: method.u,
          ...objIs === 'param' && {
            data: formData.includes('u') ? jsonToFormData(obj) : obj
          },
          ...config,
          ...typeof instanceConfig.u === 'function' ? instanceConfig.u(obj) : instanceConfig.u,
          ...objIs === 'config' && obj,
        })
      },
      list: (obj, objIs = 'param', config) => {
        return request({
          url: getUrl(url.list, obj),
          method: method.list,
          ...objIs === 'param' && {
            data: formData.includes('list') ? jsonToFormData(obj) : obj
          },
          ...config,
          ...typeof instanceConfig.list === 'function' ? instanceConfig.list(obj) : instanceConfig.list,
          ...objIs === 'config' && obj,
        })
      },
      r: (obj, objIs = 'param', config) => request({
        url: getUrl(url.r, obj),
        method: method.r,
        ...objIs === 'param' && {
          data: formData.includes('r') ? jsonToFormData(obj) : obj
        },
        ...config,
        ...typeof instanceConfig.r === 'function' ? instanceConfig.r(obj) : instanceConfig.r,
        ...objIs === 'config' && obj,
      }),
      d: (obj, objIs = 'param', config) => {
        return request({
          url: getUrl(url.d, obj),
          method: method.d,
          ...objIs === 'param' && {
            data: formData.includes('d') ? jsonToFormData(obj) : obj
          },
          ...config,
          ...typeof instanceConfig.d === 'function' ? instanceConfig.d(obj) : instanceConfig.d,
          ...objIs === 'config' && obj,
        })
      },
      updateStatus: (obj, objIs = 'param', config) => {
        return request({
          url: getUrl(url.updateStatus, obj),
          method: method.updateStatus,
          ...objIs === 'param' && {
            data: formData.includes('updateStatus') ? jsonToFormData(obj) : obj
          },
          ...config,
          ...typeof instanceConfig.updateStatus === 'function' ? instanceConfig.updateStatus(obj) : instanceConfig.updateStatus,
          ...objIs === 'config' && obj,
        })
      },
      enable: (obj, objIs = 'param', config) => {
        return request({
          url: getUrl(url.enable, obj),
          method: method.enable,
          ...objIs === 'param' && {
            data: formData.includes('enable') ? jsonToFormData(obj) : obj
          },
          ...config,
          ...typeof instanceConfig.enable === 'function' ? instanceConfig.enable(obj) : instanceConfig.enable,
          ...objIs === 'config' && obj,
        })
      },
      disable: (obj, objIs = 'param', config) => {
        return request({
          url: getUrl(url.disable, obj),
          method: method.disable,
          ...objIs === 'param' && {
            data: formData.includes('disable') ? jsonToFormData(obj) : obj
          },
          ...config,
          ...typeof instanceConfig.disable === 'function' ? instanceConfig.disable(obj) : instanceConfig.disable,
          ...objIs === 'config' && obj,
        })
      },
    }
  }
}

export const createAxiosShortcut = ({
  request
}: {
  request: (args: any) => Promise<any>
}): {
  'GET'?: (args: any) => Promise<any>,
  'POST'?: (args: any) => Promise<any>,
  'DELETE'?: (args: any) => Promise<any>,
  'PATCH'?: (args: any) => Promise<any>,
  'HEAD'?: (args: any) => Promise<any>,
  'PUT'?: (args: any) => Promise<any>,
  'DOWNLOAD'?: (args: any) => Promise<any>,
} => {
  let result = {}

  const download = (url, data, config: {
    method?: string
  } = {}) => {
    if (config.method) {
      return request({
        responseType: 'blob',
        url,
        ...config.method.toUpperCase() === 'GET' ? { params: data } : { data },
        ...config
      })
      /*.then(() => {
        Vue.prototype.$message?.success?.('操作成功')
      })*/
    } else {
      window.open(url + stringify(data, { addQueryPrefix: true }))
    }
  }

  (result as any).DOWNLOAD = download

  const upload = (url, data, config) => {
    return request({
      url,
      method: 'POST',
      data: jsonToFormData(data),
      ...config
    })
  }

  ['GET', 'POST', 'DELETE', 'PATCH', 'HEAD', 'PUT'].map(v => {
    const value = (url, data, config = {}) => {
      if (data) {
        data = paramFilter(data)
      }

      return request({
        method: v,
        url,
        ...v.toUpperCase() === 'GET' ? { params: data } : { data },
        ...config
      })
    }

    value.download = function () {
      // arguments不适用于箭头函数
      // @ts-ignore
      const [url, data, config] = arguments
      if (config?.method) {
        console.warn(prefix + 'method无法重复指定')
      }
      return download(url, data, {
        ...config,
        method: v,
      })
    }

    value.upload = function () {
      // arguments不适用于箭头函数
      // @ts-ignore
      const [url, data, config] = arguments
      if (config?.method) {
        console.warn(prefix + 'method无法重复指定')
      }
      return upload(url, data, {
        ...config,
        method: v,
      })
    }

    result[v] = value
  })

  return result
}
