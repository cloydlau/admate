export default elFormRef => {
  // 给各筛选项赋初值，使得重置功能能够正常工作
  if (elFormRef.value.fields) {
    return Object.fromEntries(
      Array.from(
        elFormRef.value.fields,
        (v: any) => [v.labelFor, undefined]
      )
    )
  }
}
