import { merge } from 'lodash-es'
import { CancelToken } from 'axios'

const METHODS_WITH_REQUEST_BODY = ['PUT', 'POST', 'DELETE', 'PATCH']
let source

export type ConfigCatalogType = {
  c?: object | ((objForConfig: object) => object),
  r?: object | ((objForConfig: object) => object),
  u?: object | ((objForConfig: object) => object),
  d?: object | ((objForConfig: object) => object),
  getList?: object | ((objForConfig: object) => object),
  updateStatus?: object | ((objForConfig: object) => object),
  enable?: object | ((objForConfig: object) => object),
  disable?: object | ((objForConfig: object) => object),
}

type APIType = {
  getList: Function,
  c: Function,
  r: Function,
  u: Function,
  d: Function,
  updateStatus: Function,
  enable: Function,
  disable: Function,
}

export default function createAPIGenerator (
  axios: (args: any) => Promise<any>,
  configCatalog_global: ConfigCatalogType = {},
): (
  urlSuffix: string,
  configCatalog?: ConfigCatalogType
) => object {
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

  const getUrl = (urlSuffix: string, url: string) =>
    url.startsWith('/') ? url :
      (urlSuffix.endsWith('/') ? urlSuffix : urlSuffix + '/') + url

  return (
    urlSuffix: string = '',
    configCatalog: ConfigCatalogType = {}
  ): APIType => {
    cancelAllRequest()
    source = CancelToken.source()

    let result = {}
    for (let k in configCatalog_default) {
      result[k] = (payload, payloadUse) => {
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

        payloadUse ??= METHODS_WITH_REQUEST_BODY.includes(config.method?.toUpperCase()) ? 'data' : 'params'

        return axios({
          ...payloadUse === 'data' && { data: payload },
          ...payloadUse === 'params' && { params: payload },
          ...config,
          url: getUrl(urlSuffix, config.url)
        })
      }
    }

    return result
  }
}

export const cancelAllRequest = () => {
  // 即使不存在pending的请求 cancel()也会触发axios.interceptors.response.use.onRejected
  if (source) {
    source.cancel()
    source = undefined
  }
}
