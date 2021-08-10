import { stringify } from 'qs'
import { merge } from 'lodash-es'
import { CancelToken } from 'axios'
import { jsonToFormData } from 'kayran'

const CONSOLE_PREFIX = import.meta.env.VITE_APP_CONSOLE_PREFIX
const METHODS_WITH_REQUEST_BODY = ['PUT', 'POST', 'DELETE', 'PATCH']
const METHODS_WITHOUT_REQUEST_BODY = ['GET', 'HEAD']
const METHODS = METHODS_WITH_REQUEST_BODY.concat(METHODS_WITHOUT_REQUEST_BODY)
let source

type configCatalogType = {
  c?: object | ((objForConfig: object) => object),
  r?: object | ((objForConfig: object) => object),
  u?: object | ((objForConfig: object) => object),
  d?: object | ((objForConfig: object) => object),
  list?: object | ((objForConfig: object) => object),
  updateStatus?: object | ((objForConfig: object) => object),
  enable?: object | ((objForConfig: object) => object),
  disable?: object | ((objForConfig: object) => object),
}

export default function createAPIGenerator (
  axios: (args: any) => Promise<any>,
  configCatalog_global: configCatalogType = {},
): (
  urlSuffix: string,
  configCatalog?: configCatalogType
) => object {
  const configCatalog_default = {
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
  }

  Object.freeze(configCatalog_default)

  const getUrl = (urlSuffix: string, url: string) =>
    url.startsWith('/') ? url :
      (urlSuffix.endsWith('/') ? urlSuffix : urlSuffix + '/') + url

  return (
    urlSuffix: string = '',
    configCatalog: configCatalogType = {}
  ): object => {
    source = CancelToken.source()

    let result = {}
    for (let k in configCatalog_default) {
      result[k] = (payload, payloadUse) => {
        if (payloadUse === 'cache') {
          return payload
        } else {
          const configObj_default = configCatalog_default[k]

          const configObj_global =
            typeof configCatalog_global[k] === 'function' ?
              configCatalog_global[k](payload) :
              configCatalog_global[k]

          const configObj = {
            cancelToken: source.token,
            ...typeof configCatalog[k] === 'function' ?
              configCatalog[k](payload) :
              configCatalog[k]
          }

          const config = merge(configObj_default, configObj_global, configObj)

          payloadUse ||= METHODS_WITH_REQUEST_BODY.includes(config.method?.toUpperCase()) ? 'data' : 'params'

          return axios({
            ...payloadUse === 'data' && { data: payload },
            ...payloadUse === 'params' && { params: payload },
            ...config,
            url: getUrl(urlSuffix, config.url)
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
        ...METHODS_WITH_REQUEST_BODY.includes(config.method.toUpperCase()) ? { data } : { params: data },
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

  METHODS.map(v => {
    const value = (url, data, config = {}) => {
      return axios({
        method: v,
        url,
        ...METHODS_WITH_REQUEST_BODY.includes(v.toUpperCase()) ? { data } : { params: data },
        ...config
      })
    }

    value.download = function () {
      // arguments不适用于箭头函数
      // @ts-ignore
      const [url, data, config] = arguments
      if (config?.method) {
        console.warn(`${CONSOLE_PREFIX}method无法重复指定`)
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
        console.warn(`${CONSOLE_PREFIX}method无法重复指定`)
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
