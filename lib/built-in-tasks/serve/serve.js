const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const chalk = require('chalk')
const openBrowser = require('react-dev-utils/openBrowser')
const devServerConfig = require('./devServerConfig')

const startDevServer = ({ host, port, changeStart, changeComplete }) => {
  const devServerInstance = new WebpackDevServer(compiler, devServerConfig(webpackConfig))
  // Launch WebpackDevServer.
  devServerInstance.listen(port, (err /* , result */) => {
    if (err) {
      observer.onError(err)
    }
  })

  const compiler = webpack(clientConfig)

  compiler.plugin('invalid', () => {
    changeStart()
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
      changeComplete()
      if (isFirstCompile) {
        isFirstCompile = false
        openBrowser(serverAddr)
      }
    }
  })
}

module.exports = ({ Observable, taskStatus, webpackConfig }) => {
  return new Observable((observer) => {
    startDevServer({
      changeStart: observer.next(taskStatus.changeStart),
      changeComplete: observer.next(taskStatus.changeComplete)
    })
  })
}
