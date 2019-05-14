import { resolvePathInProject } from './utils'
import paths from './config/paths'

/**
 * Webpack dev server config used by wparcel
 * docs can be found here https://webpack.js.org/configuration/dev-server/
 */
export default {
  compress: true,
  clientLogLevel: 'none',
  quiet: true,
  watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 500,
  },
  historyApiFallback: {
    // Paths with dots should still use the history fallback.
    // See https://github.com/facebook/create-react-app/issues/387.
    disableDotRule: true,
  },

  // https://github.com/webpack/webpack-dev-server/releases/tag/v2.4.3
  disableHostCheck: true,
  contentBase: [paths.appPublicAbs, paths.appCacheAbs],

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
