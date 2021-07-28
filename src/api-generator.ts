import { stringify, merge } from 'qs'
import { CancelToken } from 'axios'
import { jsonToFormData } from 'kayran'
import { name } from '../package.json'

const prefix = `[${name}] `
const methodsHaveRequestBody = ['PUT', 'POST', 'DELETE', 'PATCH']
let source

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

export default function createApiGenerator (
  axios: (args: any) => Promise<any>,
  config_g?: config,
): (
  module: string,
  config?: config
) => object {
  const defaultConfig = () => ({
    c: {
      url: 'create',
      method: 'POST',
    },
    r: {
      url: 'read',
      method: 'GET',
    },
    u: {
      url: 'update',
      method: 'PUT',
    },
    d: {
      url: 'delete',
      method: 'DELETE',
    },
    list: {
      url: 'list',
      method: 'GET',
    },
    updateStatus: {
      url: 'updateStatus',
      method: 'PUT',
    },
    enable: {
      url: 'enable',
      method: 'PUT',
    },
    disable: {
      url: 'disable',
      method: 'PUT',
    },
  })

  const getUrl = (urlSuffix: string, url: string) =>
    typeof url.startsWith('/') ? url :
      (urlSuffix.endsWith('/') ? urlSuffix : urlSuffix + '/') + url

  return (
    urlSuffix: string = '',
    config?: config
  ) => {
    source = CancelToken.source()
    config = merge(defaultConfig(), config_g, config)

    let result = {}
    for (let k in config) {
      result[k] = (payload, payloadUse) => {
        if (payloadUse === 'raw') {
          return payload
        } else {
          const cfg = {
            cancelToken: source.token,
            ...typeof config[k] === 'function' ?
              config[k](payload) :
              config[k],
          }

          payloadUse ||= methodsHaveRequestBody.includes(cfg.method?.toUpperCase()) ? 'data' : 'params'

          return axios({
            ...payloadUse === 'data' && { data: payload },
            ...payloadUse === 'params' && { params: payload },
            ...cfg,
            url: getUrl(urlSuffix, cfg.url)
          })
        }
      }
    }

    return result
  }
}

export const createAxiosShortcut = (axios: (args: any) => Promise<any>): {
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
      return axios({
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
    return axios({
      url,
      method: 'POST',
      data: jsonToFormData(data),
      ...config
    })
  }

  ['GET', 'POST', 'DELETE', 'PATCH', 'HEAD', 'PUT'].map(v => {
    const value = (url, data, config = {}) => {
      return axios({
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

export const cancelAllRequest = () => {
  source?.cancel('Request was canceled due to page leaving.')
}
