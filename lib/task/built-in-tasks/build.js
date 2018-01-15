const webpack = require('webpack')
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const { print, resolveProject } = require('../../utils')

const taskBuild = () => {
  const webpackConfigFile = resolveProject('webpack.config.prod.js')
  if (!checkRequiredFiles([webpackConfigFile])) {
    process.exit(1)
  }
  const webpackConfig = require(webpackConfigFile)
  const compiler = webpack(webpackConfig)

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
