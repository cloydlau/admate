import axios from 'axios'

const request = axios.create()

request.interceptors.response.use(
  response => {
    const res = response.data

    if (res.code === 0) {
      return res
    } else {
      console.error(res.message)
      return Promise.reject(res)
    }
  },
  error => {
    // cancel请求会进入该回调 此时message为空
    if (error.message) {
      if (error.message.includes('timeout')) {
        error.message = '网络超时'
      } else if (error.message === 'Network Error') {
        error.message = '网络错误'
      }
      console.error(error.message)
    }
    return Promise.reject(error)
  }
)

export default request
