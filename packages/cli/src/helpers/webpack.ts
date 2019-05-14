import path from 'path'
import webpack from 'webpack'
import checkRequiredFiles from 'react-dev-utils/checkRequiredFiles'
import { Configuration } from 'webpack'
import merge from 'webpack-merge'
import generateWebpackConfig, {
  GenerateWebpackConfigOptions,
} from '../webpack.config'
import {
  print,
  resolvePathInProject,
  getFirstExistingFile,
  getFilename,
} from '../utils'
import jsdom from 'jsdom'
import fs from 'fs'

const { JSDOM } = jsdom

type ResolveOptions = Modify<
  GenerateWebpackConfigOptions,
  {
    configFilePath?: string
    // relative or absolute path
    entryFilePath?: string
    entry?: any
  }
>

const defaultHtmlFilePath = path.resolve(__dirname, '../static/index.html')

/**
 *
 * @param filename
 * @param fileContent
 * @returns absolute file path
 */
const saveFileToCacheFolder = (
  filename: string,
  fileContent: string
): string => {
  const cacheFolderPath = resolvePathInProject('./.cache')
  if (!fs.existsSync(cacheFolderPath)) {
    fs.mkdirSync(cacheFolderPath)
  }
  const filePath = resolvePathInProject(`./.cache/${filename}`)
  fs.writeFileSync(filePath, fileContent, {
    encoding: 'utf8',
  })
  return filePath
}

/**
 * @param htmlFilePath absolute file path
 */
const prepareHtmlFile = (filePath = defaultHtmlFilePath) => {
  const filename = getFilename(filePath)
  const html = fs.readFileSync(filePath, {
    encoding: 'utf8',
  })
  const dom = new JSDOM(html)
  let entry = []
  // 如果没有 filePath 说明用的是默认 template，而默认 template 里面没有 script
  if (filePath) {
    const htmlFolderPath = path.resolve(
      path.relative(resolvePathInProject('.'), filePath),
      '../'
    )
    dom.window.document.querySelectorAll('body script').forEach(node => {
      const scriptSrc = resolvePathInProject(
        path.resolve(htmlFolderPath, node.getAttribute('src'))
      )
      entry.push(scriptSrc)
      dom.window.document.body.removeChild(node)
    })
  }
  const html2 = dom.serialize()
  const generatedHtmlAbsPath = saveFileToCacheFolder(filename, html2)
  return {
    htmlPath: generatedHtmlAbsPath,
    entry: entry.length ? entry : null,
  }
}

export const initCompiler = (options: ResolveOptions) => {
  let { configFilePath, entryFilePath, ...rest } = options
  if (!path.isAbsolute(entryFilePath)) {
    entryFilePath = resolvePathInProject(entryFilePath)
  }
  let htmlFilePath: string
  let webpackEntry
  if (entryFilePath.endsWith('.html')) {
    const { htmlPath, entry } = prepareHtmlFile(entryFilePath)
    if (!entry) {
      print.warn(`no entry was found in ${entryFilePath}`)
    }
    htmlFilePath = htmlPath
    webpackEntry = entry
  } else {
    const { htmlPath } = prepareHtmlFile(entryFilePath)
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
