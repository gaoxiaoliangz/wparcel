const generate = require('../lib/generate')

const config = generate(
  {
    polyfill: true,
    react: true,
    babel: true,
    css: {
      postcss: true
    },
    sass: {
      scoped: true
    },
    disableDepCheck: false,
    production: true,
    excludeExternals: true
  }, {
    entry: {
      app: ['babel-polyfill', './src/index.js'],
    }
  }
)
