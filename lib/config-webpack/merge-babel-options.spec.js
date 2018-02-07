const { mergeBabelOptions, mergeConfigArr } = require('./merge-babel-options')

test('mergeConfigArr', () => {
  const result = mergeConfigArr([], [])
  expect(result).toEqual([])

  const result2 = mergeConfigArr(['env'], [['env', {
    modules: false
  }]])
  expect(result2).toEqual([
    ['env', {
      modules: false
    }]
  ])
})

test('mergeBabelOptions test 1', () => {
  const result = mergeBabelOptions({
    presets: [
      'env'
    ]
  }, {
      presets: [
        ['env', {
          modules: false
        }]
      ]
    })
  expect(result).toEqual({
    presets: [
      ['env', {
        modules: false
      }]
    ]
  })
})

test('mergeBabelOptions test 2', () => {
  const result = mergeBabelOptions({
    presets: [
      ['env', {
        modules: true,
        other: 'yes'
      }],
      'abc'
    ]
  }, {
      presets: [
        ['env', {
          modules: false
        }],
        'bcd'
      ]
    })
  expect(result).toEqual({
    presets: [
      ['env', {
        modules: false,
        other: 'yes'
      }],
      'abc',
      'bcd'
    ]
  })
})
