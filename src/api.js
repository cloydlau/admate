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

export default function createAPI(axios, axiosConfig, urlPrefix) {
  // cancelAllRequest() // 嵌套使用 Admate 时，可能导致将父级的请求取消掉
  // source = CancelToken.source()

  const api = {}
  for (const listOrForm in axiosConfig) {
    for (const k in listOrForm) {
      api[k] = (payload, payloadAs) => {
        let configObj
        if (axiosConfig) {
          configObj = typeof axiosConfig[k] === 'function' ? axiosConfig[k] : axiosConfig[k]
        }

        payloadAs ??= METHODS_WITH_REQUEST_BODY.includes(configObj.method?.toUpperCase() || '')
          ? 'data'
          : 'params'

        return axios({
          ...(payloadAs === 'data' && { data: payload }),
          ...(payloadAs === 'params' && { params: payload }),
          ...configObj,
          url: createURL(urlPrefix, configObj.url),
        })
      }
    }
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
