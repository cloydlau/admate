import type { MockMethod } from 'vite-plugin-mock'
import mockjs from 'mockjs'

const { Random } = mockjs

function getRandomPics(count = 10): string[] {
  const arr: string[] = []
  for (let i = 0; i < count; i++) {
    arr.push(Random.image('800x600', Random.color(), Random.color(), Random.title()))
  }
  return arr
}

const records = (() => {
  const result: any[] = []
  for (let index = 0; index < 50; index++) {
    result.push({
      'id': `${index}`,
      'beginTime': '@datetime',
      'endTime': '@datetime',
      'address': '@city()',
      'name': '@cname()',
      'name1': '@cname()',
      'name2': '@cname()',
      'name3': '@cname()',
      'name4': '@cname()',
      'name5': '@cname()',
      'name6': '@cname()',
      'name7': '@cname()',
      'name8': '@cname()',
      'avatar': Random.image('400x400', Random.color(), Random.color(), Random.first()),
      'imgArr': getRandomPics(Math.ceil(Math.random() * 3) + 1),
      'imgs': getRandomPics(Math.ceil(Math.random() * 3) + 1),
      'date': '@date(\'yyyy-MM-dd\')',
      'time': '@time(\'HH:mm\')',
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
    url: `${API_PREFIX}/list`,
    timeout: 100,
    method: 'get',
    response: ({ query }) => {
      const { page = 1, pageSize = 10 } = query
      return {
        code: 0,
        data: {
          page, pageSize, records,
        },
      }
    },
  },
  {
    url: `${API_PREFIX}`,
    method: 'post',
    response: () => {
      return { code: 0 }
    },
  },
  {
    url: `${API_PREFIX}`,
    method: 'delete',
    response: () => {
      return { code: 0 }
    },
  },
  {
    url: `${API_PREFIX}`,
    method: 'get',
    response: () => {
      return {
        code: 0,
        data: records[0],
      }
    },
  },
  {
    url: `${API_PREFIX}`,
    method: 'put',
    response: () => {
      return { code: 0 }
    },
  },
  {
    url: `${API_PREFIX}/updateStatus`,
    method: 'put',
    response: () => {
      return { code: 0 }
    },
  },
] as MockMethod[]
