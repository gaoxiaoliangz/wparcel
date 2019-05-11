import webpack from 'webpack'
import Rx from 'rxjs/Rx'
import merge from 'webpack-merge'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import { TASK_STATUS } from '../constants'
import { resolveWebpackConfig } from '../helpers/helpers'

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
  let webpackConfig = resolveWebpackConfig(configFilePath)

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
    webpackConfig = merge(webpackConfig, {
      plugins: [
        new BundleAnalyzerPlugin({
          analyzerPort: 8022,
        }),
      ],
    })
  }
  const compiler = webpack(webpackConfig)

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
