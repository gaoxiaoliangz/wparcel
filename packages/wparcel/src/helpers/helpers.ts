import path from 'path'
import checkRequiredFiles from 'react-dev-utils/checkRequiredFiles'
import { Configuration } from 'webpack'
import merge from 'webpack-merge'
import baseWebpackConfig from '../webpack.config'
import { print, resolvePathInProject, getFirstExistingFile } from '../utils'

export const resolvePackagePath = relPath =>
  path.resolve(process.cwd(), relPath)

export const resolveWebpackConfig = (configFilePath?: string) => {
  // 用户指定的 webpack 配置文件
  let webpackConfig = {}
  if (configFilePath) {
    if (!checkRequiredFiles([configFilePath])) {
      process.exit(1)
    }
    webpackConfig = require(configFilePath)
    print.log(`${configFilePath} is being used`)
  }
  const finalWebpackConfig = merge(
    baseWebpackConfig as Configuration,
    webpackConfig
  )
  return finalWebpackConfig
}

export const toOutputString = (stats, config?) => {
  return stats.toString(
    config || {
      colors: true,
    }
  )
}

export const toErrorOutputString = stats => {
  return stats.toString('errors-only')
}
