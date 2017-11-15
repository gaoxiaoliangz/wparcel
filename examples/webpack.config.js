const getBaseConfig = require('../lib/get-base-config')

const config = getBaseConfig(
  {
    features: {
      polyfill: true,
      react: true,
      babel: {
        reactyes: 0,
        other: 2
      },
      sass: true,
      // postcss: true
    }
  }, {
    entry: {
      app: ['babel-polyfill'],
    }
  }
)

// console.log(config)
