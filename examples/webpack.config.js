const getBaseConfig = require('../lib/get-base-config')

const config = getBaseConfig(
  {
    features: {
      polyfill: true,
      react: true,
      babel: true,
      sass: true,
      // postcss: true
    }
  }, {
    entry: {
      app: ['babel-polyfill'],
    }
  }
)
