import webpack, { Configuration } from 'webpack'
import merge from 'webpack-merge'
import checkRequiredFiles from 'react-dev-utils/checkRequiredFiles'
import { print } from '../utils'
import generateWebpackConfig, {
  GenerateWebpackConfigOptions,
} from '../webpack.config'
import { handleEntry } from './entry'
import { prepareAssetFolder } from './asset'

type ResolveOptions = Modify<
  GenerateWebpackConfigOptions,
  {
    configFilePath?: string
    // relative or absolute path
    entryFilePath?: string
    entry?: any
    outDir?: string
  }
>

const defaultOptions: Partial<ResolveOptions> = {
  outDir: 'build',
}

export const initCompiler = (options: ResolveOptions) => {
  let { configFilePath, entryFilePath, webpackEnv, outDir, ...rest } = {
    ...defaultOptions,
    ...options,
  }

  prepareAssetFolder(outDir)
  // TODO: copy files from `public` to `outDir`
  // handleEntry 执行了很多 side effects，并不确信这么写会很好
  const { htmlFilePathAbs, entry } = handleEntry(entryFilePath, {
    outDir,
    webpackEnv,
  })

  // 用户指定的 webpack 配置文件
  let webpackConfig = {}
  if (configFilePath) {
    if (!checkRequiredFiles([configFilePath])) {
      process.exit(1)
    }
    webpackConfig = require(configFilePath)
    print.log(`${configFilePath} is being used`)
  }

  // 用户提供的 config 目前只能以高优先级合并，如果想完全替换默认的 config 暂不支持
  const finalWebpackConfig = merge(
    generateWebpackConfig({
      ...rest,
      webpackEnv,
      htmlFilePathAbs,
      entry,
      outDir,
    }) as Configuration,
    webpackConfig
  )
  return {
    compiler: webpack(finalWebpackConfig),
    webpackConfig: finalWebpackConfig,
    outDir,
  }
}
