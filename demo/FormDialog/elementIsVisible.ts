export default element => {
  const { top, right, bottom, left } =
    element.getBoundingClientRect()
  const yInView =
    top > 0 && top < window.innerHeight
    && bottom > 0 && bottom < window.innerHeight
  const xInView =
    left > 0 && left < window.innerWidth
    && right > 0 && right < window.innerWidth
  return yInView && xInView
}
