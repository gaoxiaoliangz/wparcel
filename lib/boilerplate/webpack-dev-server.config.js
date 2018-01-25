/**
 * Webpack dev server config used by Jellyweb
 * docs can be found here https://webpack.js.org/configuration/dev-server/
 */
module.exports = {
  compress: true,
  clientLogLevel: 'none',
  quiet: true,
  watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 500
  },

  // https://github.com/webpack/webpack-dev-server/releases/tag/v2.4.3
  disableHostCheck: true,

  // Some common config
  // HMR
  // hot: true,

  // Proxy
  // proxy: {
  //   '*': {
  //     target: 'http://localhost:8080',
  //   }
  // },

  // cors
  // before(app) {
  //   app.use((req, res, next) => {
  //     res.setHeader('Access-Control-Allow-Origin', '*')
  //     next()
  //   })
  // }
}
