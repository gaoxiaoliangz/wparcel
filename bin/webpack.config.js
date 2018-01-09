const { generateConfig, resolveApp } = require('webpack-auto')

module.exports = generateConfig({
  babel: true,
  sass: {
    extract: true
  },
  media: {
    dataUrl: true,
  },
  production: false,
}, {
  entry: {
    main: resolveApp('src/index.js'),
  },
  output: {
    path: resolveApp('build'),
    filename: '[name].js',
    publicPath: '/static/'
  },
  devtool: 'sourcemap'
})
