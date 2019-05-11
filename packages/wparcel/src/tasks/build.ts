import * as webpack from 'webpack'
import * as Rx from 'rxjs/Rx'
import * as merge from 'webpack-merge'
import { Configuration } from 'webpack'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import * as checkRequiredFiles from 'react-dev-utils/checkRequiredFiles'
import { print, resolveProject, getFirstExistingFile } from '../utils'
import baseWebpackConfig from '../webpack.config.base'
import { TASK_STATUS } from '../constants'

const CONFIG_FALLBACK_CHAIN = [
  'webpack.config.prod.js',
  'webpack.config.js',
  'webpack.config.dev.js',
]

const toOutputString = (stats, config?) => {
  return stats.toString(
    config || {
      colors: true,
    }
  )
}

const toErrorOutputString = stats => {
  return stats.toString('errors-only')
}

interface BuildConfig {
  analysis: boolean
  configFilePath: string
  watch: boolean
}

const build = (config: BuildConfig) => {
  const { analysis, configFilePath, watch } = config
  // 用户指定的 webpack 配置文件
  let webpackConfig = {}
  if (configFilePath) {
    if (!checkRequiredFiles(configFilePath)) {
      process.exit(1)
    }
    webpackConfig = require(configFilePath)
    print.log(`${configFilePath} is being used`)
  }
  let finalWebpackConfig = merge(
    baseWebpackConfig as Configuration,
    webpackConfig
  )
  // const requiredFiles = []
  // if (argv.config) {
  //   requiredFiles.push(argv.config)
  // } else {
  //   const configFile = getFirstExistingFile(CONFIG_FALLBACK_CHAIN)
  //   requiredFiles.push(configFile ? configFile : CONFIG_FALLBACK_CHAIN[0])
  // }
  // if (!checkRequiredFiles(requiredFiles)) {
  //   process.exit(1)
  // }
  // const webpackConfigFile = resolveProject(requiredFiles[0])
  // const webpackConfig0 = require(webpackConfigFile)
  // const webpackConfig =
  //   typeof webpackConfig0 === 'function'
  //     ? webpackConfig0({
  //         argv,
  //       })
  //     : webpackConfig0
  // let mergedConfig = merge(baseConfig as webpack.Configuration, webpackConfig)
  if (analysis) {
    finalWebpackConfig = merge(finalWebpackConfig, {
      plugins: [
        new BundleAnalyzerPlugin({
          analyzerPort: 8022,
        }),
      ],
    })
  }
  const compiler = webpack(finalWebpackConfig)

  if (watch) {
    return Rx.Observable.create(observer => {
      compiler.hooks.done.tap('invalid', () => {
        observer.next({
          type: TASK_STATUS.CHANGE_START,
        })
      })
      compiler.watch(
        {
          aggregateTimeout: 300,
          poll: false,
        },
        (err, stats) => {
          if (err || stats.hasErrors()) {
            observer.next({
              type: TASK_STATUS.CHANGE_ERROR,
              payload: toErrorOutputString(stats),
            })
          } else {
            observer.next({
              type: TASK_STATUS.CHANGE_COMPLETE,
            })
          }
        }
      )
    })
  }

  return new Promise((resolve, reject) => {
    return compiler.run((err, stats) => {
      if (err) {
        return reject(err)
      }
      const hasError = stats.hasErrors()
      // TODO: 是否需要特殊处理？
      // const hasWarning = stats.hasWarnings()
      if (hasError) {
        return reject(toErrorOutputString(stats))
      }
      return resolve(toOutputString(stats))
    })
  })
}

export default build
