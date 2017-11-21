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
    disableDepCheck: true,
    production: true,
  }, {
    entry: {
      app: ['babel-polyfill'],
    }
  }
)
