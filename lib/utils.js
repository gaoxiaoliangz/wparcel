const not = v => !v
const compose = (...funcs) => {
  return (...args) => funcs.reduce((result, func, index) => {
    return index === 0
      ? func.apply(args)
      : func.call(result)
  })
}