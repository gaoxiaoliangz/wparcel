import fs from 'fs'
import paths from './config/paths'

interface Options {
  contentBase?: string[]
  proxy?: {}
}

/**
 * Webpack dev server config used by wparcel
 * docs can be found here https://webpack.js.org/configuration/dev-server/
 */
export default ({ contentBase, proxy }: Options = {}) => {
  return {
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
    contentBase: [paths.appPublic, ...contentBase],

    // HMR
    hot: true,

    proxy,

    before(app, server) {
      if (fs.existsSync(paths.proxySetup)) {
        // This registers user provided middleware for proxy reasons
        require(paths.proxySetup)(app)
      }
    },
  }
}
