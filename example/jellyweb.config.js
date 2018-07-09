const { resolveProject } = require('../lib')

module.exports = {
  entry: {
    app: ['babel-polyfill', './src/index.js']
  },
  output: {
    filename: '[name].js',
    path: resolveProject('build')
  },
  features: {
    babel: true,
    css: true,
    sass: {
      scoped: true,
    },
    production: true,
    excludeExternals: true,
    media: {
      dataUrl: false
    }
  }
}
