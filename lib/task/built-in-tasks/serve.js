const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const chalk = require('chalk')
const openBrowser = require('react-dev-utils/openBrowser')
const getLocalIP = require('../../utils/get-local-ip')

const localIP = getLocalIP()

const startDevServer = ({
  host,
  port,
  protocol,
  changeStart,
  changeComplete,
  webpackConfig,
  devServerConfig
}) => {
  let isFirstCompile = true
  const compiler = webpack(webpackConfig)

  compiler.plugin('invalid', () => {
    changeStart()
  })

  compiler.plugin('done', (stats) => {
    if (stats.hasErrors()) {
      console.info(stats.toString(webpackConfig.stats))
    } else {
      const serverAddr = `${protocol}://${host}:${port}/`
      console.info(chalk.cyan(`Server running at ${serverAddr}`))
      if (localIP !== 'localhost') {
        console.info(chalk.cyan(`Also available at http://${localIP}:${port}/`))
      } else {
        console.info(chalk.red('No network available, we cannot access via IP address!'))
      }
      changeComplete()
      if (isFirstCompile) {
        isFirstCompile = false
        openBrowser(serverAddr)
      }
    }
  })

  if (!devServerConfig.publicPath && webpackConfig.output.publicPath) {
    devServerConfig.publicPath = webpackConfig.output.publicPath
  }

  const devServerInstance = new WebpackDevServer(compiler, devServerConfig)
  // Launch WebpackDevServer
  devServerInstance.listen(port, (err /* , result */) => {
    if (err) {
      observer.onError(err)
    }
  })
}

module.exports = (webpackConfig, devServerConfig) => ({ Observable, taskStatus }) => {
  return Observable.create((observer) => {
    startDevServer({
      changeStart: () => observer.next(taskStatus.changeStart),
      changeComplete: () => observer.next(taskStatus.changeComplete),
      host: 'localhost',
      port: '4002',
      protocol: 'http',
      webpackConfig,
      devServerConfig
    })
  })
}
