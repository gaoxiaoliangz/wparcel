import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import chalk from 'chalk'
import _ from 'lodash'
import openBrowser from 'react-dev-utils/openBrowser'
import { clientConfig } from '../webpack.config'
import Observable from '../Observable'
import getLocalIP from '../getLocalIP'

const localIP = getLocalIP()
let isFirstCompile = true

function runDevServer(host, port, protocol) {
  return new Observable((observer) => {
    const compiler = webpack(clientConfig)

    compiler.plugin('invalid', () => {
      observer.onNext('invalid')
    })

    compiler.plugin('done', (stats) => {
      if (stats.hasErrors()) {
        console.info(stats.toString(clientConfig.stats))
      } else {
        const serverAddr = `${protocol}://${host}:${port}/`
        console.info(chalk.cyan(`Server running at ${serverAddr}`))
        if (localIP !== 'localhost') {
          console.info(chalk.cyan(`Also available at http://${localIP}:${port}/`))
        } else {
          console.info(chalk.red('No network available, we cannot access via IP address!'))
        }
        observer.onNext('done')
        if (isFirstCompile) {
          isFirstCompile = false
          openBrowser(serverAddr)
        }
      }
    })

    const devServerInstance = new WebpackDevServer(compiler, {
      compress: true,
      clientLogLevel: 'none',
      hot: true,
      publicPath: clientConfig.output.publicPath,
      quiet: true,
      watchOptions: {
        ignored: /node_modules/,
        aggregateTimeout: 500
      },
      proxy: {
        '*': {
          target: 'http://localhost:8090',
          // doesn't seem to be needed, but juest keep it here as a reference
          // bypass: (req, /* res, proxyOptions */) => { // eslint-disable-line consistent-return
          //   if (req.url.indexOf('app.js') !== -1) {
          //     return false
          //   }
          // }
        }
      },
      // Enable HTTPS if the HTTPS environment variable is set to 'true'
      https: protocol === 'https',
      host,

      // https://github.com/webpack/webpack-dev-server/releases/tag/v2.4.3
      // insecure, but works fine when in dev
      disableHostCheck: true,

      // access to express
      setup(app) {
        app.use((req, res, next) => {
          res.setHeader('Access-Control-Allow-Origin', '*')
          next()
        })
      }
    })

    // Launch WebpackDevServer.
    devServerInstance.listen(port, (err /* , result */) => {
      if (err) {
        observer.onError(err)
      }
    })
  })
}

function devServer() {
  const port = process.env.WEBPACK_PORT
  // hmr required config is added here, webpack.config.js doesn't contain any
  clientConfig.entry.app = [...new Set([
    // activate HMR for React
    'react-hot-loader/patch',

    // ?http://localhost:port cannot be left out
    // bundle the client for webpack-dev-server
    // and connect to the provided endpoint
    `webpack-dev-server/client?http://${localIP}:${port}`,

    // bundle the client for hot reloading
    // only- means to only hot reload for successful updates
    'webpack/hot/only-dev-server',
  ].concat(clientConfig.entry.app))]

  clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
  // clientConfig.plugins.push(new webpack.NoEmitOnErrorsPlugin())

  // the shape of the object may change, when it does, remember to update it here
  // find 'babel-loader' and add 'react-hot-loader/babel' into 'options.plugins'
  for (const rule of clientConfig.module.rules) { // eslint-disable-line no-restricted-syntax
    if (rule.use) {
      const loader = _.find(rule.use, x => x.loader === 'babel-loader')
      if (loader) {
        loader.options.plugins = ['react-hot-loader/babel'].concat(loader.options.plugins || [])
        break
      }
    }
  }

  const protocol = 'http'
  const host = 'localhost'

  return runDevServer(host, port, protocol)
}

export default devServer
