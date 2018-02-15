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
  production: true,
  scopedClassName: '[hash:base64:8]',
  presets: [
    'production'
  ]
}, {
  entry: {
    main: resolveProject('src/index.js'),
  },
  output: {
    path: resolveProject('build'),
    filename: '[name]-[hash:8].js',
    publicPath: '/'
  }
})
