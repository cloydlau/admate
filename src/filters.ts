export function key2label (
  value: any,
  arr: object[],
  props?: { key?: string, label?: string }
) {
  if (arr) {
    const { key = 'dataValue', label = 'dataName' } = props || {}
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

export function dialogTitle (value: string, catalog?: object) {
  return value ? {
    c: '新增',
    r: '查看',
    u: '编辑',
    ...catalog,
  }[value] : ''
}
