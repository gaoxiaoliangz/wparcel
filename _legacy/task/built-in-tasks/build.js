const webpack = require('webpack')
const _ = require('lodash')
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const { print, resolveProject, getFirstExistingFile } = require('../../utils')
const configWebpack = require('../../config-webpack')

const CONFIG_FALLBACK_CHAIN = [
  'jellyweb.config.prod.js',
  'jellyweb.config.js',
  'jellyweb.config.dev.js',
  'webpack.config.prod.js',
  'webpack.config.js',
  'webpack.config.dev.js',
]

const taskBuild = ({ argv, Observable, taskStatus }) => {
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
  const webpackConfig = typeof webpackConfig0 === 'function'
    ? webpackConfig0({
      argv
    })
    : webpackConfig0

  let compiler
  if (webpackConfig.features) {
    compiler = webpack(configWebpack(webpackConfig.features, _.omit(webpackConfig, ['features'])))
  } else {
    compiler = webpack(webpackConfig)
  }

  print.log(`${webpackConfigFile} is being used`)

  if (argv.watch || argv.w) {
    return Observable.create((observer) => {
      compiler.plugin('invalid', () => {
        observer.next(taskStatus.changeStart)
      })
      compiler.watch({
        aggregateTimeout: 300,
        poll: false
      }, (err, stats) => {
        if (err || stats.hasErrors()) {
          console.info(stats.toString(webpackConfig.stats)) // eslint-disable-line
        } else {
          observer.next(taskStatus.changeComplete)
        }
      })
    })
  }

  return new Promise((resolve, reject) => {
    return compiler.run((err, stats) => {
      if (err) {
        return reject(err)
      }
      const statsConfig = Object.assign({}, {
        colors: true
      }, webpackConfig.stats)
      console.log(stats.toString(statsConfig)) // eslint-disable-line
      return resolve()
    })
  })
}

module.exports = taskBuild
