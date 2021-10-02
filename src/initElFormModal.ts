export default elFormRef => {
  // 给各筛选项赋初值，使得重置功能能够正常工作
  if (elFormRef.fields) {
    return Object.fromEntries(
      Array.from(
        elFormRef.fields,
        (v: any) => [v.labelFor, undefined]
      )
    )
  }
}
