import webpack from 'webpack'
import _ from 'lodash'
import Rx from 'rxjs/Rx'
import WebpackDevServer from 'webpack-dev-server'
import openBrowser from 'react-dev-utils/openBrowser'
import { print, resolveProject, getFirstExistingFile } from '../utils'
import getLocalIP from '../utils/getLocalIP'
import { resolveWebpackConfig, toErrorOutputString } from '../helpers/helpers'
import devServerConfig from '../webpackDevServer.config'
import { TASK_STATUS } from '../constants'

const localIP = getLocalIP()

const CONFIG_FALLBACK_CHAIN = [
  'jellyweb.config.dev.js',
  'jellyweb.config.js',
  'jellyweb.config.prod.js',
  'webpack.config.dev.js',
  'webpack.config.js',
  'webpack.config.prod.js',
]

interface ServeConfig {
  port?: number
  configFilePath?: string
  openBrowser?: boolean
}

const defaultConfig = {
  port: 4006,
  shouldOpenBrowser: true,
}

const serve = (config: ServeConfig) => {
  const finalConfig = {
    ...defaultConfig,
    ...config,
  }
  const { port, configFilePath, shouldOpenBrowser } = finalConfig
  // const { Observable, taskStatus, argv } = context
  // const options = {
  //   openBrowser: !argv.nob,
  //   port: argv.port || DEFAULT_PORT,
  //   config: argv.config,
  //   devServerConfig: argv.devServerConfig || 'webpackDevServer.config.js',
  // }
  // const requiredFiles = [options.devServerConfig]

  // if (options.config) {
  //   requiredFiles.unshift(options.config)
  // } else {
  //   const configFile = getFirstExistingFile(CONFIG_FALLBACK_CHAIN)
  //   requiredFiles.unshift(configFile ? configFile : CONFIG_FALLBACK_CHAIN[0])
  // }
  // const requiredFilesFullPath = requiredFiles.map(resolveProject)

  // if (!checkRequiredFiles(requiredFilesFullPath)) {
  //   process.exit(1)
  // }
  // const configs = requiredFilesFullPath.map(require)
  // const webpackConfig0 = configs[0]
  // const devServerConfig = configs[1]
  // const port = options.port

  // const webpackConfig =
  //   typeof webpackConfig0 === 'function'
  //     ? webpackConfig0({
  //         port,
  //         localIP,
  //         argv,
  //       })
  //     : webpackConfig0

  const webpackConfig = resolveWebpackConfig(configFilePath)

  const startDevServer = ({
    onChangeStart,
    onChangeComplete,
    onChangeError,
  }) => {
    let isFirstCompile = true
    const compiler = webpack(webpackConfig)

    compiler.hooks.done.tap('invalid', () => {
      onChangeStart()
    })

    compiler.hooks.done.tap('done', stats => {
      if (stats.hasErrors()) {
        onChangeError(toErrorOutputString(stats))
      } else {
        const serverAddr = `http://localhost:${port}/`
        const networkAddr =
          localIP !== 'localhost' ? `http://${localIP}:${port}/` : 'N/A'
        onChangeComplete(`
Local:     ${serverAddr}
Network:   ${networkAddr}
`)

        if (isFirstCompile) {
          isFirstCompile = false
          if (shouldOpenBrowser) {
            openBrowser(serverAddr)
          }
        }
      }
    })

    // if (!devServerConfig.publicPath && webpackConfig.output.publicPath) {
    //   devServerConfig.publicPath = webpackConfig.output.publicPath
    // }

    const devServerInstance = new WebpackDevServer(
      compiler,
      devServerConfig as WebpackDevServer.Configuration
    )
    // Launch WebpackDevServer
    devServerInstance.listen(port, (err /* , result */) => {
      if (err) {
        onChangeError(err)
      }
    })
  }

  return Rx.Observable.create(observer => {
    startDevServer({
      onChangeStart: () =>
        observer.next({
          type: TASK_STATUS.CHANGE_START,
        }),
      onChangeComplete: output =>
        observer.next({
          type: TASK_STATUS.CHANGE_COMPLETE,
          payload: output,
        }),
      onChangeError: error =>
        observer.next({
          type: TASK_STATUS.CHANGE_ERROR,
          payload: error,
        }),
    })
  })
}

export default serve
