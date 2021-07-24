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

export default function createCRUDGenerator ({
  request,
  config,
  url,
  method,
}: {
  request: (args: any) => Promise<any>,
  config?: config,
  url?: url,
  method?: method,
}): (module: string, config?: object) => object {
  const globalRequest = request

  const globalConfig = {
    c: {
      url: 'create',
      method: 'POST',
    },
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
    r: 'read',
    u: 'update',
    d: 'delete',
    list: 'list',
    updateStatus: 'updateStatus',
    enable: 'enable',
    disable: 'disable',
    ...url,
  }

  const globalMethod = {
    c: 'POST',
    r: 'GET',
    u: 'PUT',
    d: 'DELETE',
    list: 'GET',
    updateStatus: 'PUT',
    enable: 'PUT',
    disable: 'PUT',
    ...method
  }

  /**
   * @param {string} module - 接口模块前缀
   * @param {object} url - 默认接口地址混入
   */
  return function CRUDGenerator (module: string, {
    request,
    config,
    url,
    method,
  }: {
    request?: (args: any) => Promise<any>,
    config?: config,
    url?: url,
    method?: method,
  } = {}) {
    // 保证module不为null
    module = module || ''

    request = request || globalRequest
    const localConfig = {
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

    const getUrl = (suffix, objForConfig) =>
      typeof suffix === 'function' ? suffix(objForConfig) :
        suffix.startsWith('/') ? suffix : (module.endsWith('/') ? module : module + '/') + suffix

    return {
      c: (obj, objIs = 'param') => {
        return request({
          url: getUrl(url.c),
          method: method.c,
          ...objIs === 'param' && {
            data: obj
          },
          ...typeof localConfig.c === 'function' ? localConfig.c(obj) : localConfig.c,
        })
      },
      u: (obj, objIs = 'param') => {
        return request({
          url: getUrl(url.u),
          method: method.u,
          ...objIs === 'param' && {
            data: obj
          },
          ...typeof localConfig.u === 'function' ? localConfig.u(obj) : localConfig.u,
        })
      },
      list: (obj, objIs = 'param') => {
        return request({
          url: getUrl(url.list),
          method: method.list,
          ...objIs === 'param' && {
            data: obj
          },
          ...typeof localConfig.list === 'function' ? localConfig.list(obj) : localConfig.list,
        })
      },
      r: (obj, objIs = 'param') => request({
        url: getUrl(url.r),
        method: method.r,
        ...objIs === 'param' && {
          data: obj
        },
        ...typeof localConfig.r === 'function' ? localConfig.r(obj) : localConfig.r,
      }),
      d: (obj, objIs = 'param') => {
        return request({
          url: getUrl(url.d),
          method: method.d,
          ...objIs === 'param' && {
            data: obj
          },
          ...typeof localConfig.d === 'function' ? localConfig.d(obj) : localConfig.d,
        })
      },
      updateStatus: (obj, objIs = 'param') => {
        return request({
          url: getUrl(url.updateStatus),
          method: method.updateStatus,
          ...objIs === 'param' && {
            data: obj
          },
          ...typeof localConfig.updateStatus === 'function' ? localConfig.updateStatus(obj) : localConfig.updateStatus,
        })
      },
      enable: (obj, objIs = 'param') => {
        return request({
          url: getUrl(url.enable),
          method: method.enable,
          ...objIs === 'param' && {
            data: obj
          },
          ...typeof localConfig.enable === 'function' ? localConfig.enable(obj) : localConfig.enable,
        })
      },
      disable: (obj, objIs = 'param') => {
        return request({
          url: getUrl(url.disable),
          method: method.disable,
          ...objIs === 'param' && {
            data: obj
          },
          ...typeof localConfig.disable === 'function' ? localConfig.disable(obj) : localConfig.disable,
        })
      },
    }
  }
}

export const createRequestShortcut = (axiosInstance: (args: any) => Promise<any>): {
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
      return axiosInstance({
        responseType: 'blob',
        url,
        ...config.method.toUpperCase() === 'GET' ? { params: data } : { data },
        ...config
      })
    } else {
      window.open(url + stringify(data, { addQueryPrefix: true }))
    }
  }

  (result as any).DOWNLOAD = download

  const upload = (url, data, config) => {
    return axiosInstance({
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

      return axiosInstance({
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
