function name({a = 1, b = 3, c = { a = 1}} = {}) {
  console.log(a, b, c)
}

name({a:2, c: {}})
name()
