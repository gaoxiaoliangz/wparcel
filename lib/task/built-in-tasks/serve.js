const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const chalk = require('chalk')
const openBrowser = require('react-dev-utils/openBrowser')
const getLocalIP = require('../../utils/get-local-ip')
const { print, resolveProject } = require('../../utils')

const DEFAULT_PORT = 4006
const localIP = getLocalIP()

/**
 * @param {{ Observable, taskStatus, argv: { nob: Boolean, port } }} context 
 */
const taskServe = context => {
  const { Observable, taskStatus, argv } = context
  const requiredFiles = [
    'webpack.config.dev.js',
    'dev-server.config.js'
  ].map(filename => resolveProject(filename))

  const options = {
    openBrowser: !argv.nob,
    port: argv.port || DEFAULT_PORT
  }

  if (!checkRequiredFiles(requiredFiles)) {
    process.exit(1)
  }
  const configs = requiredFiles.map(require)
  const webpackConfig = configs[0]
  const devServerConfig = configs[1]
  const port = options.port

  const startDevServer = ({
    changeStart,
    changeComplete
  }) => {
    let isFirstCompile = true
    const compiler = webpack(webpackConfig)

    compiler.plugin('invalid', () => {
      changeStart()
    })

    compiler.plugin('done', (stats) => {
      if (stats.hasErrors()) {
        print.log(stats.toString(webpackConfig.stats))
      } else {
        changeComplete()
        const serverAddr = `http://localhost:${port}/`
        const networkAddr = localIP !== 'localhost' ? `http://${localIP}:${port}/` : 'N/A'
        print.log(...[
          '\n',
          `Local:     ${serverAddr}\n`,
          `Network:   ${networkAddr}\n`
        ])

        if (isFirstCompile) {
          isFirstCompile = false
          if (options.openBrowser) {
            openBrowser(serverAddr)
          }
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

  return Observable.create((observer) => {
    startDevServer({
      changeStart: () => observer.next(taskStatus.changeStart),
      changeComplete: () => observer.next(taskStatus.changeComplete)
    })
  })
}

module.exports = taskServe
