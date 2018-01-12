// TODO
const { configWebpack, resolveProject } = require('jellyweb')

module.exports = configWebpack({
  // Here are the features that have been enabled
  babel: {
    react: true,
  },
  // sass: {
  //   extract: true
  // },
  // media: {
  //   dataUrl: true,
  // }
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
