import path from 'path'
import webpack, { Configuration } from 'webpack'
import merge from 'webpack-merge'
import { resolvePathInProject, print } from '../utils'
import { prepareHtmlFile } from './html'
import checkRequiredFiles from 'react-dev-utils/checkRequiredFiles'
import generateWebpackConfig, {
  GenerateWebpackConfigOptions,
} from '../webpack.config'

type ResolveOptions = Modify<
  GenerateWebpackConfigOptions,
  {
    configFilePath?: string
    // relative or absolute path
    entryFilePath?: string
    entry?: any
  }
>

export const initCompiler = (options: ResolveOptions) => {
  let { configFilePath, entryFilePath, webpackEnv, outDir, ...rest } = options
  if (!path.isAbsolute(entryFilePath)) {
    entryFilePath = resolvePathInProject(entryFilePath)
  }
  let htmlFilePath: string
  let webpackEntry
  if (entryFilePath.endsWith('.html')) {
    const { htmlPath, entry } = prepareHtmlFile(entryFilePath, outDir)
    if (!entry) {
      print.warn(`no entry was found in ${entryFilePath}`)
    }
    htmlFilePath = htmlPath
    webpackEntry = entry
  } else {
    const { htmlPath } = prepareHtmlFile(entryFilePath, outDir)
    htmlFilePath = htmlPath
    webpackEntry = entryFilePath
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
      ...rest,
      webpackEnv,
      htmlFilePath,
      entry: webpackEntry,
    }) as Configuration,
    webpackConfig
  )
  return {
    compiler: webpack(finalWebpackConfig),
    webpackConfig: finalWebpackConfig,
  }
}
