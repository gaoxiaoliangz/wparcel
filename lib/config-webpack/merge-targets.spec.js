const { targetToObject, mergeTargets, accessObjectByPath } = require('./merge-targets')
const { Feature } = require('./features')

test('access object by path', () => {
  expect(accessObjectByPath({a:{b:{c:1}}}, 'a.b.c')).toBe(1)
  expect(accessObjectByPath({a:{b:{c:1}}}, ['a', 'b', 'c'])).toBe(1)
})

test('target to object', () => {
  expect(targetToObject('module.plugins[]', { test: 1 })).toEqual({
    module: {
      plugins: [
        {
          test: 1
        }
      ]
    }
  })

  expect(targetToObject('a.b.c.d[]', { x: 1 })).toEqual({
    a: {
      b: {
        c: {
          d: [
            {
              x: 1
            }
          ]
        }
      }
    }
  })

  expect(targetToObject('a.b.c.d{}', { x: 1 })).toEqual({
    a: {
      b: {
        c: {
          d: {
            x: 1
          }
        }
      }
    }
  })

  expect(targetToObject('a.b.c.d', { x: 1 })).toEqual({
    a: {
      b: {
        c: {
          d: {
            x: 1
          }
        }
      }
    }
  })
})

test('merge test 1', () => {
  const tars = [
    Feature.setTarget('module.plugins[]', { test: 1 }),
    Feature.setTarget('module.plugins[]', { test: 2 }),
  ]
  expect(mergeTargets(tars)).toEqual({
    module: {
      plugins: [
        {
          test: 1,
        },
        {
          test: 2,
        }
      ]
    }
  })
})

test('merge test 2', () => {
  const tars = [
    Feature.setTarget('module.a{}', { test: 1 }, 2),
    Feature.setTarget('module.a{}', { test: 2 }, 5),
  ]
  expect(mergeTargets(tars)).toEqual({
    module: {
      a: {
        test: 2
      }
    }
  })
})

test('merge test 3', () => {
  const tars = [
    Feature.setTarget('module.c', 'c', 2),
    Feature.setTarget('module.d', { test: 1 }, 2),
    Feature.setTarget('module.d', { test: 2 }, 5),
  ]
  expect(mergeTargets(tars)).toEqual({
    module: {
      c: 'c',
      d: {
        test: 2
      }
    }
  })
})

test('merge test 4', () => {
  const tars = [
    Feature.setTarget('module.c', 'c', 2),
    Feature.setTarget('module.d{}', { test: 1 }, 2),
    Feature.setTarget('module.d', { test2: 2 }, 5),
    Feature.setTarget('module.d', { test2: 7 }, 7),
  ]
  expect(mergeTargets(tars)).toEqual({
    module: {
      c: 'c',
      d: {
        test: 1,
        test2: 7
      }
    }
  })
})
