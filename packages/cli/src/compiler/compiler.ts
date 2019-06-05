import webpack, { Configuration } from 'webpack'
import path from 'path'
import merge from 'webpack-merge'
import checkRequiredFiles from 'react-dev-utils/checkRequiredFiles'
import { print, resolvePathInProject } from '../utils'
import generateWebpackConfig, {
  GenerateWebpackConfigOptions,
} from '../webpack.config'
import { handleEntry } from './entry'
import { prepareAssetFolder } from './asset'

// console.time('webpack')
// import webpack, { Configuration } from 'webpack'
// console.timeEnd('webpack')
// import path from 'path'
// console.time('webpack-merge')
// import merge from 'webpack-merge'
// console.timeEnd('webpack-merge')
// console.time('react-dev-utils/checkRequiredFiles')
// import checkRequiredFiles from 'react-dev-utils/checkRequiredFiles'
// console.timeEnd('react-dev-utils/checkRequiredFiles')
// console.time('rest')
// import { print, resolvePathInProject } from '../utils'
// console.time('webpack.config')
// import generateWebpackConfig, {
//   GenerateWebpackConfigOptions,
// } from '../webpack.config'
// console.timeEnd('webpack.config')
// import { handleEntry } from './entry'
// import { prepareAssetFolder } from './asset'
// console.timeEnd('rest')

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
    let configFilePathAbs = configFilePath
    if (!path.isAbsolute(configFilePath)) {
      configFilePathAbs = resolvePathInProject(configFilePath)
    }
    if (!checkRequiredFiles([configFilePathAbs])) {
      process.exit(1)
    }
    webpackConfig = require(configFilePathAbs)
    print.log(`${configFilePathAbs} is being used`)
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
