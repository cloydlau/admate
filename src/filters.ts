export function key2label__ (value: any, arr: object[], props = 'dataValue/dataName') {
  if (arr) {
    const [key, label] = props.split('/')
    let result = arr.filter(v => v[key] === value)
    if (result.length > 0) {
      return result[0][label]
    } else {
      return ''
    }
  } else {
    return ''
  }
}

export function dialogTitle__ (value: string, catalog?: object) {
  return value ? {
    c: '新增',
    r: '查看',
    u: '编辑',
    ...catalog,
  }[value] : ''
}
