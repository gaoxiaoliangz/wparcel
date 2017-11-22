// const webpack = require('webpack')
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
    typescript: true,
    disableDepCheck: true,
    production: true,
    excludeExternals: true
  }, {
    entry: {
      app: ['babel-polyfill', './src/index.js'],
    }
  }
)

// webpack(config)
