import _ from 'lodash'
import fs from 'fs'
import Rx from 'rxjs/Rx'
import WebpackDevServer from 'webpack-dev-server'
import openBrowser from 'react-dev-utils/openBrowser'
import ForkTsCheckerWebpackPlugin from 'react-dev-utils/ForkTsCheckerWebpackPlugin'
import formatWebpackMessages from 'react-dev-utils/formatWebpackMessages'
import typescriptFormatter from 'react-dev-utils/typescriptFormatter'
import { choosePort, prepareProxy } from 'react-dev-utils/WebpackDevServerUtils'
import getIP from '../utils/getIP'
import { toErrorOutputString } from '../helpers/helpers'
import createDevServerConfig from '../webpackDevServer.config'
import { TASK_STATUS } from '../constants'
import { initCompiler } from '../compiler/compiler'
import { resolvePathInProject } from '../utils'
import paths from '../config/paths'

process.env.BABEL_ENV = 'development'
process.env.NODE_ENV = 'development'

interface ServeConfig {
  port?: number
  configFilePath?: string
  shouldOpenBrowser?: boolean
  entryFilePath: string
}

const defaultConfig = {
  port: 4006,
  shouldOpenBrowser: false,
}

const serve = (config: ServeConfig) => {
  const finalConfig = {
    ...defaultConfig,
    ..._.pickBy(config, v => v !== undefined),
  }
  const { configFilePath, shouldOpenBrowser, entryFilePath } = finalConfig
  const useTypeScript = fs.existsSync(paths.appTsConfig)
  // default port or port defined by user
  let port0 = finalConfig.port

  const startDevServer = async ({
    onChangeStart,
    onChangeComplete,
    onChangeError,
  }) => {
    const port = await choosePort(getIP(), port0)
    let isFirstCompile = true
    const { compiler, outDir } = initCompiler({
      webpackEnv: 'development',
      configFilePath,
      entryFilePath,
    })
    let tsMessagesPromise
    let tsMessagesResolver

    if (useTypeScript) {
      compiler.hooks.beforeCompile.tap('beforeCompile', () => {
        tsMessagesPromise = new Promise(resolve => {
          tsMessagesResolver = msgs => resolve(msgs)
        })
      })

      ForkTsCheckerWebpackPlugin.getCompilerHooks(compiler).receive.tap(
        'afterTypeScriptCheck',
        (diagnostics, lints) => {
          const allMsgs = [...diagnostics, ...lints]
          const format = message =>
            `${message.file}\n${typescriptFormatter(message, true)}`

          tsMessagesResolver({
            errors: allMsgs.filter(msg => msg.severity === 'error').map(format),
            warnings: allMsgs
              .filter(msg => msg.severity === 'warning')
              .map(format),
          })
        }
      )
    }

    compiler.hooks.done.tap('invalid', () => {
      onChangeStart()
    })

    compiler.hooks.done.tap('done', async stats => {
      if (stats.hasErrors()) {
        onChangeError(toErrorOutputString(stats))
      } else {
        if (useTypeScript) {
          const messages = await tsMessagesPromise

          if (messages.errors.length || messages.warnings.length) {
            const formatedMessages = formatWebpackMessages({
              errors: messages.errors,
              warnings: messages.warnings,
            })
            onChangeError(formatedMessages.errors.join('\n\n'))
            return
          }
        }
        const ip = getIP()
        const serverAddr = `http://localhost:${port}/`
        const networkAddr = `http://${ip}:${port}/`
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

    // Load proxy config
    const proxySetting = require(paths.appPackageJson).proxy
    const proxyConfig = prepareProxy(proxySetting, paths.appPublic)

    const serverConfig = createDevServerConfig({
      proxy: proxyConfig,
      contentBase: [resolvePathInProject(outDir)],
    })

    const devServerInstance = new WebpackDevServer(
      compiler,
      serverConfig as WebpackDevServer.Configuration
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
          meta: {
            useRed: false,
          },
        }),
    })
  })
}

export default serve
