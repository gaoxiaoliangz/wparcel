const { resolveProject } = require('jellyweb')

module.exports = {
  entry: {
    main: resolveProject('src/index.js'),
  },
  output: {
    path: resolveProject('build'),
    filename: '[name].js',
    publicPath: '/'
  },
  devtool: 'sourcemap',
  features: {
    babel: true,
    define: {},
    css: true,
    media: {
      dataUrl: true
    },
    production: false,
  }
}
