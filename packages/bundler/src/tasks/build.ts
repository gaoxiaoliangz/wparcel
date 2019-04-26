const webpack = require('webpack')
const merge = require('webpack-merge')
const clearConsole = require('react-dev-utils/clearConsole')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const { print, resolveProject, getFirstExistingFile } = require('../utils')
const baseConfig = require('../webpack.config.base')

const CONFIG_FALLBACK_CHAIN = [
  'webpack.config.prod.js',
  'webpack.config.js',
  'webpack.config.dev.js',
]

const printWebpackStats = (stats, config) => {
  console.log(stats.toString(config))
}

const taskBuild = ({ argv, Observable, taskStatus, analysis }) => {
  const requiredFiles = []
  if (argv.config) {
    requiredFiles.push(argv.config)
  } else {
    const configFile = getFirstExistingFile(CONFIG_FALLBACK_CHAIN)
    requiredFiles.push(configFile ? configFile : CONFIG_FALLBACK_CHAIN[0])
  }
  if (!checkRequiredFiles(requiredFiles)) {
    process.exit(1)
  }
  const webpackConfigFile = resolveProject(requiredFiles[0])
  const webpackConfig0 = require(webpackConfigFile)
  const webpackConfig =
    typeof webpackConfig0 === 'function'
      ? webpackConfig0({
          argv,
        })
      : webpackConfig0
  let mergedConfig = merge(baseConfig, webpackConfig)
  if (analysis) {
    mergedConfig = merge(mergedConfig, {
      plugins: [
        new BundleAnalyzerPlugin({
          analyzerPort: 8022,
        }),
      ],
    })
  }
  const compiler = webpack(mergedConfig)

  print.log(`${webpackConfigFile} is being used`)

  if (argv.watch || argv.w) {
    return Observable.create(observer => {
      compiler.hooks.done.tap('invalid', () => {
        observer.next(taskStatus.changeStart)
      })
      compiler.watch(
        {
          aggregateTimeout: 300,
          poll: false,
        },
        (err, stats) => {
          if (err || stats.hasErrors()) {
            // TODO: 这个应该放在 runTask 里处理，包括应该可以控制是否清除
            clearConsole()
            printWebpackStats(stats, mergedConfig.stats)
          } else {
            observer.next(taskStatus.changeComplete)
          }
        },
      )
    })
  }

  return new Promise((resolve, reject) => {
    return compiler.run((err, stats) => {
      if (err) {
        return reject(err)
      }
      printWebpackStats(stats, {
        colors: true,
      })
      return resolve()
    })
  })
}

module.exports = taskBuild
