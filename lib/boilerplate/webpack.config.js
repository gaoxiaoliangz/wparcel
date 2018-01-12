// TODO
const { generateConfig, resolveApp } = require('webpack-auto')

module.exports = generateConfig({
  // Here are the features that have been enabled
  babel: true,
  sass: {
    extract: true
  },
  media: {
    dataUrl: true,
  }
}, {
  entry: {
    main: resolveApp('src/index.js'),
  },
  output: {
    path: resolveApp('build'),
    filename: '[name].js',
    publicPath: '/static/'
  },
  devtool: 'sourcemap',
})
