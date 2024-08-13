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
  // 如果配置非函数，则不需要每次调用接口都重新计算 URL
  let url
  if (!(typeof config === 'function')) {
    url = createURL(urlPrefix, config.url)
  }

  return config
    ? (payload, payloadAs) => {
        let configComputed = config
        if (typeof config === 'function') {
          configComputed = config(payload)
          url = createURL(urlPrefix, configComputed.url)
        }

        if (payload) {
          payloadAs ??= METHODS_WITH_REQUEST_BODY.includes(configComputed.method?.toUpperCase() || '')
            ? 'data'
            : 'params'
        }

        return axios({
          ...payload && {
            ...(payloadAs === 'data' && { data: payload }),
            ...(payloadAs === 'params' && { params: payload }),
          },
          ...configComputed,
          url,
        })
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
