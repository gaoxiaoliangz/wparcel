const { configWebpack, resolveProject } = require('jellyweb')

module.exports = configWebpack({
  features: [
    'babel',
    'define',
    'css',
    ['media', {
      dataUrl: true
    }]
  ],
  production: false
}, {
  entry: {
    main: resolveProject('src/index.js'),
  },
  output: {
    path: resolveProject('build'),
    filename: '[name].js',
    publicPath: '/static/'
  },
  devtool: 'sourcemap',
})
