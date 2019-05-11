import checkRequiredFiles from 'react-dev-utils/checkRequiredFiles'
import { Configuration } from 'webpack'
import merge from 'webpack-merge'
import baseWebpackConfig from '../webpack.config.base'
import { print, resolveProject, getFirstExistingFile } from '../utils'

export const resolveWebpackConfig = (configFilePath?: string) => {
  // 用户指定的 webpack 配置文件
  let webpackConfig = {}
  if (configFilePath) {
    if (!checkRequiredFiles(configFilePath)) {
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
