import { MockMethod } from 'vite-plugin-mock'
import { Random } from 'mockjs'
import { resultSuccess, resultPageSuccess } from '../_util'

function getRandomPics (count = 10): string[] {
  const arr: string[] = []
  for (let i = 0; i < count; i++) {
    arr.push(Random.image('800x600', Random.color(), Random.color(), Random.title()))
  }
  return arr
}

const demoList = (() => {
  const result: any[] = []
  for (let index = 0; index < 50; index++) {
    result.push({
      id: `${index}`,
      beginTime: '@datetime',
      endTime: '@datetime',
      address: '@city()',
      name: '@cname()',
      name1: '@cname()',
      name2: '@cname()',
      name3: '@cname()',
      name4: '@cname()',
      name5: '@cname()',
      name6: '@cname()',
      name7: '@cname()',
      name8: '@cname()',
      avatar: Random.image('400x400', Random.color(), Random.color(), Random.first()),
      imgArr: getRandomPics(Math.ceil(Math.random() * 3) + 1),
      imgs: getRandomPics(Math.ceil(Math.random() * 3) + 1),
      date: `@date('yyyy-MM-dd')`,
      time: `@time('HH:mm')`,
      'no|100000-10000000': 100000,
      'status|1': ['normal', 'enable', 'disable'],
    })
  }
  return result
})()

const BASE = '/basic-api'
const MODULE = '/module-a'
export const API_PREFIX = `${BASE}${MODULE}`

export default [
  {
    url: `${API_PREFIX}/queryForPage`,
    timeout: 100,
    method: 'post',
    response: ({ query }) => {
      const { page = 1, pageSize = 10 } = query
      return resultPageSuccess(page, pageSize, demoList)
    },
  },
  {
    url: `${API_PREFIX}/create`,
    method: 'POST',
    response: () => {
      return resultSuccess()
    },
  },
  {
    url: `${API_PREFIX}/delete`,
    method: 'POST',
    response: () => {
      return resultSuccess()
    },
  },
  {
    url: `${API_PREFIX}/queryForDetail`,
    method: 'POST',
    response: () => {
      return resultSuccess(demoList[0])
    },
  },
  {
    url: `${API_PREFIX}/update`,
    method: 'POST',
    response: () => {
      return resultSuccess()
    },
  },
  {
    url: `${API_PREFIX}/updateStatus`,
    method: 'POST',
    response: () => {
      return resultSuccess()
    },
  },
] as MockMethod[]
