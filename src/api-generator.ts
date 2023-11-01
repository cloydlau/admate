import { merge } from 'lodash-es'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import type { PayloadAs } from './index'

const METHODS_WITH_REQUEST_BODY = ['PUT', 'POST', 'DELETE', 'PATCH']

export type Actions = 'c' | 'r' | 'u' | 'd' | 'getList' | 'updateStatus' | 'enable' | 'disable' | any

export default function createAPIGenerator(
  axios: AxiosInstance,
  // configCatalog_global: Record<Actions, AxiosRequestConfig | ((config?: object) => AxiosRequestConfig)>,
): (urlSuffix: string, configCatalog?: Record<Actions, object | ((config?: object) => AxiosRequestConfig)>) => Record<Actions, (payload: any, payloadAs: PayloadAs) => Promise<unknown>> {
  const configCatalog_default: Record<Actions, AxiosRequestConfig> = {
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

  const createURL = (urlSuffix: string, url?: string): string =>
    url ? url.startsWith('/') ? url : (urlSuffix.endsWith('/') ? urlSuffix : `${urlSuffix}/`) + url : urlSuffix

  return (urlSuffix: string, configCatalog?: Record<Actions, object | ((config?: object) => AxiosRequestConfig)>): Record<Actions, (payload: any, payloadAs: PayloadAs) => Promise<unknown>> => {
    // cancelAllRequest() // 嵌套使用 Admate 时，可能导致将父级的请求取消掉
    // source = CancelToken.source()

    const result: Record<Actions, (payload: any, payloadAs: PayloadAs) => Promise<unknown>> = {}
    for (const k in configCatalog_default) {
      result[k] = (payload: any, payloadAs: PayloadAs) => {
        const configObj_default = configCatalog_default[k]

        /* let configObj_global
        if (configCatalog_global) {
          configObj_global = typeof configCatalog_global[k] === 'function'
            ? (configCatalog_global[k] as (config?: object) => AxiosRequestConfig)(payload)
            : configCatalog_global[k]
        } */

        let configObj
        if (configCatalog) {
          configObj = typeof configCatalog[k] === 'function' ? (configCatalog[k] as (config?: object) => AxiosRequestConfig)(payload) : configCatalog[k]
        }

        const config = merge(configObj_default, configObj)

        payloadAs ??= METHODS_WITH_REQUEST_BODY.includes(config.method?.toUpperCase() || '')
          ? 'data'
          : 'params'

        return axios({
          ...(payloadAs === 'data' && { data: payload }),
          ...(payloadAs === 'params' && { params: payload }),
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
