/**
 * Webpack dev server config used by Jellyweb
 * docs can be found here https://webpack.js.org/configuration/dev-server/
 */
module.exports = {
  compress: true,
  clientLogLevel: 'none',
  // HMR
  // hot: true,
  quiet: true,
  watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 500
  },
  // proxy
  // proxy: {
  //   '*': {
  //     target: 'http://localhost:8080',
  //   }
  // },

  // https://github.com/webpack/webpack-dev-server/releases/tag/v2.4.3
  // insecure, but works fine when in dev
  disableHostCheck: true,

  // cors
  // before(app) {
  //   app.use((req, res, next) => {
  //     res.setHeader('Access-Control-Allow-Origin', '*')
  //     next()
  //   })
  // }
}
