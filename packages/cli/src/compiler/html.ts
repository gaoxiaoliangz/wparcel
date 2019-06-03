import path from 'path'
import { JSDOM } from 'jsdom'
import fs from 'fs'
import { getFilename, resolvePathInProject } from '../utils'
import paths, { folders } from '../config/paths'
import { copyFileToAssetFolder } from './asset'

interface PrepareHtmlFileOptions {
  htmlPathAbs: string
  outDir: string
  isDevEnv: boolean
}

/**
 * @param htmlFilePath absolute file path
 */
// TODO: 支持 watch html 文件变化
export const prepareHtmlFile = (options: PrepareHtmlFileOptions) => {
  const { htmlPathAbs, outDir } = options
  const filename = getFilename(htmlPathAbs)
  const html = fs.readFileSync(htmlPathAbs, {
    encoding: 'utf8',
  })
  const dom = new JSDOM(html)
  let entry = []

  /**
   *
   * @param filename
   * @param fileContent
   * @returns absolute cache file path
   */
  const saveFileToOutDir = (filename: string, fileContent: string): string => {
    const destDir = resolvePathInProject(outDir)
    const filePath = path.resolve(destDir, filename)
    fs.writeFileSync(filePath, fileContent, {
      encoding: 'utf8',
    })
    return filePath
  }

  if (htmlPathAbs) {
    const resolveFilePathInHtml = (relPath: string) => {
      const htmlFolderPath = path.resolve(
        path.relative(resolvePathInProject('.'), htmlPathAbs),
        '../'
      )
      return resolvePathInProject(path.resolve(htmlFolderPath, relPath))
    }

    const handleCopy = attrName => node => {
      const src = node.getAttribute(attrName)
      if (src) {
        const filePath = resolveFilePathInHtml(src)
        const newFilePath = copyFileToAssetFolder(filePath, outDir)
        const newFilename = getFilename(newFilePath)
        // TODO: base path
        const newSrc = `/${folders.assets}/${newFilename}`
        node.setAttribute(attrName, newSrc)
      }
    }

    // link, img 资源拷贝
    dom.window.document.querySelectorAll('body img').forEach(handleCopy('src'))
    dom.window.document.querySelectorAll('link').forEach(handleCopy('href'))

    // 获取 entry
    dom.window.document.querySelectorAll('body script').forEach(node => {
      const src = node.getAttribute('src')
      const useRaw = node.getAttribute('raw') !== null

      if (src) {
        if (useRaw) {
          node.removeAttribute('raw')
          handleCopy('src')(node)
          return
        }
        const scriptSrc = resolveFilePathInHtml(src)
        entry.push(scriptSrc)
        dom.window.document.body.removeChild(node)
      }
    })
  }
  const html2 = dom.serialize()
  const generatedHtmlAbsPath = saveFileToOutDir(filename, html2)

  return {
    htmlPath: generatedHtmlAbsPath,
    entry: entry.length ? entry : null,
  }
}
