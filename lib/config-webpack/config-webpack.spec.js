const { preprocessJellyConfig } = require('./config-webpack')

test('preprocessJellyConfig 1', () => {
  expect(preprocessJellyConfig({
    features: [
      'css',
      ['babel', {
        babelrc: true
      }]
    ]
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
    features: [
      'css',
      ['babel', {
        babelrc: true
      }],
      'extract-css'
    ],
    presets: [
      'production'
    ]
  })).toEqual({
    features: {
      css: {},
      babel: {
        babelrc: true
      },
      md5Hash: {},
      compress: {},
      extractCss: {
        __test: 1
      },
    },
    context: {}
  })
})

test('preprocessJellyConfig 2: feature vs preset priority', () => {
  expect(preprocessJellyConfig({
    features: [
      ['css'],
      ['babel', {
        babelrc: true
      }],
      ['extract-css', {
        __test: 2
      }]
    ],
    presets: [
      'production'
    ]
  })).toEqual({
    features: {
      css: {},
      babel: {
        babelrc: true
      },
      md5Hash: {},
      compress: {},
      extractCss: {
        __test: 2
      },
    },
    context: {}
  })
})
