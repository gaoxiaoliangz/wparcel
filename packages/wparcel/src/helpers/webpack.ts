import checkRequiredFiles from 'react-dev-utils/checkRequiredFiles'
import { Configuration } from 'webpack'
import merge from 'webpack-merge'
import generateWebpackConfig, {
  GenerateWebpackConfigOptions,
} from '../webpack.config'
import { print, resolvePathInProject, getFirstExistingFile } from '../utils'

interface ResolveOptions extends GenerateWebpackConfigOptions {
  configFilePath?: string
}

export const resolveWebpackConfig = (options: ResolveOptions) => {
  const { configFilePath, ...rest } = options
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
    generateWebpackConfig({
      ...rest,
    }) as Configuration,
    webpackConfig
  )
  return finalWebpackConfig
}
