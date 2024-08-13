const METHODS_WITH_REQUEST_BODY = ['PUT', 'POST', 'DELETE', 'PATCH']

const createURL = (urlPrefix, url) =>
  url
    ? url.startsWith('/')
      ? url
      : (urlPrefix.endsWith('/')
          ? urlPrefix
          : `${urlPrefix}/`)
          + url
    : urlPrefix

function configToCaller(axios, urlPrefix, config) {
  return config
    ? (payload, payloadAs) => {
        const configComputed = typeof config === 'function' ? config(payload) : config

        if (payload) {
          payloadAs ??= METHODS_WITH_REQUEST_BODY.includes(configComputed.method?.toUpperCase() || '')
            ? 'data'
            : 'params'
          if (payloadAs === 'data') {
            configComputed.data = payload
          }
          else if (payloadAs === 'params') {
            configComputed.params = payload
          }
        }

        configComputed.url = createURL(urlPrefix, configComputed.url)

        return axios(configComputed)
      }
    : () => {}
}

export default function createAPI(axios, axiosConfig) {
  // cancelAllRequest() // 嵌套使用 Admate 时，可能导致将父级的请求取消掉
  // source = CancelToken.source()

  const api = {
    list: {
      read: configToCaller(axios, axiosConfig.urlPrefix, axiosConfig.list.read),
    },
    form: {},
  }

  for (const k in axiosConfig.form) {
    api.form[k] = configToCaller(axios, axiosConfig.urlPrefix, axiosConfig.form[k])
  }

  return api
}

/* export const cancelAllRequest = () => {
  // 即使不存在 pending 的请求 cancel() 也会触发 axios.interceptors.response.use.onRejected
  if (source) {
    source.cancel()
    source = undefined
  }
} */
