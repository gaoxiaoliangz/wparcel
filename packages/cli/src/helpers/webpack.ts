import path from 'path'
import webpack from 'webpack'
import checkRequiredFiles from 'react-dev-utils/checkRequiredFiles'
import { Configuration } from 'webpack'
import merge from 'webpack-merge'
import generateWebpackConfig, {
  GenerateWebpackConfigOptions,
} from '../webpack.config'
import { print, resolvePathInProject, getFilename } from '../utils'
import jsdom from 'jsdom'
import fs from 'fs'
import paths from '../config/paths'

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

const prepareCacheFolder = () => {
  const destPath = paths.appCacheStaticAbs
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath, {
      recursive: true,
    })
  }
}

/**
 *
 * @param filename
 * @param fileContent
 * @returns absolute cache file path
 */
const saveFileToCacheFolder = (
  filename: string,
  fileContent: string
): string => {
  const cacheFolderPath = paths.appCacheAbs
  const filePath = path.resolve(cacheFolderPath, filename)
  fs.writeFileSync(filePath, fileContent, {
    encoding: 'utf8',
  })
  return filePath
}

/**
 * @param filePath absolute file path
 */
// TODO: add file hash
const copyFileToCacheFolder = (filePath: string, toStatic = false) => {
  const folderPath = toStatic ? paths.appCacheStaticAbs : paths.appCacheAbs
  const filename = getFilename(filePath)
  const destFilePath = path.resolve(folderPath, filename)
  fs.copyFileSync(filePath, destFilePath)
  return destFilePath
}

/**
 * @param htmlFilePath absolute file path
 */
// TODO: 支持 watch html 文件变化
const prepareHtmlFile = (filePath: string = paths.defaultHtmlFileAbs) => {
  const filename = getFilename(filePath)
  const html = fs.readFileSync(filePath, {
    encoding: 'utf8',
  })
  const dom = new JSDOM(html)
  let entry = []
  // 如果没有 filePath 说明用的是默认 template，而默认 template 里面没有 script
  if (filePath) {
    prepareCacheFolder()

    const resolveFilePathInHtml = (relPath: string) => {
      const htmlFolderPath = path.resolve(
        path.relative(resolvePathInProject('.'), filePath),
        '../'
      )
      return resolvePathInProject(path.resolve(htmlFolderPath, relPath))
    }

    const handleCopy = attrName => node => {
      const src = node.getAttribute(attrName)
      if (src) {
        const filePath = resolveFilePathInHtml(src)
        const newFilePath = copyFileToCacheFolder(filePath, true)
        const newFilename = getFilename(newFilePath)
        // TODO: base path
        const newSrc = `/static/${newFilename}`
        node.setAttribute(attrName, newSrc)
      }
    }

    // link, img 资源拷贝
    dom.window.document.querySelectorAll('body img').forEach(handleCopy('src'))
    dom.window.document.querySelectorAll('link').forEach(handleCopy('href'))

    // 获取 entry
    dom.window.document.querySelectorAll('body script').forEach(node => {
      const src = node.getAttribute('src')
      if (src) {
        const scriptSrc = resolveFilePathInHtml(src)
        entry.push(scriptSrc)
        dom.window.document.body.removeChild(node)
      }
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
