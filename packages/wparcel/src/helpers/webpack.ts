import webpack from 'webpack'
import checkRequiredFiles from 'react-dev-utils/checkRequiredFiles'
import { Configuration } from 'webpack'
import merge from 'webpack-merge'
import generateWebpackConfig, {
  GenerateWebpackConfigOptions,
} from '../webpack.config'
import { print, resolvePathInProject, getFirstExistingFile } from '../utils'

interface ResolveOptions extends GenerateWebpackConfigOptions {
  configFilePath?: string
  // relative path
  entryFilePath?: string
}

export const initCompiler = (options: ResolveOptions) => {
  const { configFilePath, entryFilePath, ...rest } = options
  let htmlFilePath
  if (entryFilePath.endsWith('.html')) {
    htmlFilePath = resolvePathInProject(entryFilePath)
  }

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
      htmlFilePath,
      ...rest,
    }) as Configuration,
    webpackConfig
  )
  return webpack(finalWebpackConfig)
}
