import { key2label, dialogTitle } from '../src/filters'

describe('key2label', () => {
  it('no props', () => {
    expect(key2label('22', [
      { dataName: '1', dataValue: '11' },
      { dataName: '2', dataValue: '22' },
    ])).toBe('2')
  })
  it('props', () => {
    expect(key2label('11', [
      { name: '1', value: '11' },
      { name: '2', value: '22' },
    ], {
      key: 'value',
      label: 'name'
    })).toBe('1')
  })
})

describe('dialogTitle', () => {
  it('default', () => {
    expect(dialogTitle('c')).toBe('新增')
  })
  it('overwrite', () => {
    expect(dialogTitle('c', {
      c: '添加'
    })).toBe('添加')
  })
  it('extend', () => {
    expect(dialogTitle('x', {
      x: '未知'
    })).toBe('未知')
  })
})
