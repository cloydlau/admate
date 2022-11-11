import { merge } from 'lodash-es'

const METHODS_WITH_REQUEST_BODY = ['PUT', 'POST', 'DELETE', 'PATCH']

export interface ConfigCatalogType {
  c?: object | ((objForConfig: object) => object)
  r?: object | ((objForConfig: object) => object)
  u?: object | ((objForConfig: object) => object)
  d?: object | ((objForConfig: object) => object)
  getList?: object | ((objForConfig: object) => object)
  updateStatus?: object | ((objForConfig: object) => object)
  enable?: object | ((objForConfig: object) => object)
  disable?: object | ((objForConfig: object) => object)
}

interface APIType {
  getList: Function
  c: Function
  r: Function
  u: Function
  d: Function
  updateStatus: Function
  enable: Function
  disable: Function
}

export default function createAPIGenerator(
  axios: (args: any) => Promise<any>,
  configCatalog_global: ConfigCatalogType = {},
): (
    urlSuffix: string,
    configCatalog?: ConfigCatalogType
  ) => APIType {
  const configCatalog_default = {
    c: {
      method: 'POST',
    },
    r: {
      method: 'GET',
    },
    u: {
      method: 'PUT',
    },
    d: {
      method: 'DELETE',
    },
    getList: {
      method: 'GET',
    },
    updateStatus: {
      method: 'PUT',
    },
    enable: {
      method: 'PUT',
    },
    disable: {
      method: 'PUT',
    },
  }

  Object.freeze(configCatalog_default)

  const createURL = (urlSuffix: string, url: string) =>
    url.startsWith('/')
      ? url
      : (urlSuffix.endsWith('/') ? urlSuffix : `${urlSuffix}/`) + url

  return (
    urlSuffix = '',
    configCatalog: ConfigCatalogType = {},
  ): APIType => {
    // cancelAllRequest() // 嵌套使用 Admate 时，可能导致将父级的请求取消掉
    // source = CancelToken.source()

    const result = {} as APIType
    for (const k in configCatalog_default) {
      result[k] = (payload, payloadAs) => {
        const configObj_default = configCatalog_default[k]

        const configObj_global = typeof configCatalog_global[k] === 'function'
          ? configCatalog_global[k](payload)
          : configCatalog_global[k]

        const configObj = typeof configCatalog[k] === 'function'
          ? configCatalog[k](payload)
          : configCatalog[k]

        const config = merge(configObj_default, configObj_global, configObj)

        payloadAs ??= METHODS_WITH_REQUEST_BODY.includes(config.method?.toUpperCase()) ? 'data' : 'params'

        return axios({
          ...payloadAs === 'data' && { data: payload },
          ...payloadAs === 'params' && { params: payload },
          ...config,
          url: createURL(urlSuffix, config.url),
        })
      }
    }

    return result
  }
}

/* export const cancelAllRequest = () => {
  // 即使不存在 pending 的请求 cancel() 也会触发 axios.interceptors.response.use.onRejected
  if (source) {
    source.cancel()
    source = undefined
  }
} */
