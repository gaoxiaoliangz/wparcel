const { preprocessJellyConfig } = require('./config-webpack')

test('preprocessJellyConfig 1', () => {
  expect(preprocessJellyConfig({
    css: {},
    babel: {
      babelrc: true
    }
  })).toEqual({
    features: {
      css: {},
      babel: {
        babelrc: true
      }
    },
    context: {}
  })
})

test('preprocessJellyConfig 2', () => {
  expect(preprocessJellyConfig({
    css: {},
    babel: {
      babelrc: true
    },
    production: false,
    scopedClassName: 'abc'
  })).toEqual({
    features: {
      css: {},
      babel: {
        babelrc: true
      }
    },
    context: {
      production: false,
      scopedClassName: 'abc'
    }
  })
})

test('preprocessJellyConfig 3', () => {
  expect(preprocessJellyConfig({
    css: {},
    babel: {
      babelrc: true
    },
    production: false,
    scopedClassName: 'abc',
    unknown: 1
  })).toEqual({
    features: {
      css: {},
      babel: {
        babelrc: true
      },
      unknown: {}
    },
    context: {
      production: false,
      scopedClassName: 'abc',
    }
  })
})

test('preprocessJellyConfig 4', () => {
  expect(preprocessJellyConfig({
    css: true,
    babel: {
      babelrc: true
    }
  })).toEqual({
    features: {
      css: {},
      babel: {
        babelrc: true
      }
    },
    context: {}
  })
})

test('preprocessJellyConfig 5', () => {
  expect(preprocessJellyConfig({
    css: false,
    babel: {
      babelrc: true
    }
  })).toEqual({
    features: {
      babel: {
        babelrc: true
      }
    },
    context: {}
  })
})
