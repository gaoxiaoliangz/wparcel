const webpack = require('webpack')
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const { print, resolveProject } = require('../../utils')

const taskBuild = ({ argv, Observable, taskStatus }) => {
  const webpackConfigFile = resolveProject(argv.config || 'webpack.config.prod.js')
  if (!checkRequiredFiles([webpackConfigFile])) {
    process.exit(1)
  }
  const webpackConfig0 = require(webpackConfigFile)
  const webpackConfig = typeof webpackConfig0 === 'function'
    ? webpackConfig0({
      argv
    })
    : webpackConfig0

  const compiler = webpack(webpackConfig)

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

      print.log(stats.toString(webpackConfig.stats))
      return resolve()
    })
  })
}

module.exports = taskBuild
