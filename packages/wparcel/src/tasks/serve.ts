import webpack from 'webpack'
import _ from 'lodash'
import WebpackDevServer from 'webpack-dev-server'
import checkRequiredFiles from 'react-dev-utils/checkRequiredFiles'
import openBrowser from 'react-dev-utils/openBrowser'
import { print, resolveProject, getFirstExistingFile } from '../utils'
import getLocalIP from '../utils/getLocalIP'
// import configWebpack from '../../config-webpack'

const DEFAULT_PORT = 4006
const localIP = getLocalIP()

const CONFIG_FALLBACK_CHAIN = [
  'jellyweb.config.dev.js',
  'jellyweb.config.js',
  'jellyweb.config.prod.js',
  'webpack.config.dev.js',
  'webpack.config.js',
  'webpack.config.prod.js',
]

/**
 * @param {{ Observable, taskStatus, argv: { nob: Boolean, port } }} context
 */
const taskServe = context => {
  const { Observable, taskStatus, argv } = context
  const options = {
    openBrowser: !argv.nob,
    port: argv.port || DEFAULT_PORT,
    config: argv.config,
    devServerConfig: argv.devServerConfig || 'webpackDevServer.config.js',
  }
  const requiredFiles = [options.devServerConfig]

  if (options.config) {
    requiredFiles.unshift(options.config)
  } else {
    const configFile = getFirstExistingFile(CONFIG_FALLBACK_CHAIN)
    requiredFiles.unshift(configFile ? configFile : CONFIG_FALLBACK_CHAIN[0])
  }
  const requiredFilesFullPath = requiredFiles.map(resolveProject)

  if (!checkRequiredFiles(requiredFilesFullPath)) {
    process.exit(1)
  }
  const configs = requiredFilesFullPath.map(require)
  const webpackConfig0 = configs[0]
  const devServerConfig = configs[1]
  const port = options.port

  const webpackConfig =
    typeof webpackConfig0 === 'function'
      ? webpackConfig0({
          port,
          localIP,
          argv,
        })
      : webpackConfig0

  const startDevServer = ({ changeStart, changeComplete }) => {
    let isFirstCompile = true
    let compiler
    if (webpackConfig.features) {
      compiler = webpack(
        configWebpack(
          webpackConfig.features,
          _.omit(webpackConfig, ['features'])
        )
      )
    } else {
      compiler = webpack(webpackConfig)
    }

    print.log(`${requiredFiles[0]} is being used`)

    compiler.plugin('invalid', () => {
      changeStart()
    })

    compiler.plugin('done', stats => {
      if (stats.hasErrors()) {
        const statsConfig = Object.assign(
          {},
          {
            colors: true,
          },
          webpackConfig.stats
        )
        console.log(stats.toString(statsConfig)) // eslint-disable-line
      } else {
        changeComplete()
        const serverAddr = `http://localhost:${port}/`
        const networkAddr =
          localIP !== 'localhost' ? `http://${localIP}:${port}/` : 'N/A'
        print.log(
          ...['\n', `Local:     ${serverAddr}\n`, `Network:   ${networkAddr}\n`]
        )

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
        print.error(err)
      }
    })
  }

  return Observable.create(observer => {
    startDevServer({
      changeStart: () => observer.next(taskStatus.changeStart),
      changeComplete: () => observer.next(taskStatus.changeComplete),
    })
  })
}

module.exports = taskServe
