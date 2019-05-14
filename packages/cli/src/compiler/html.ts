import path from 'path'
import { JSDOM } from 'jsdom'
import fs from 'fs'
import { getFilename, resolvePathInProject } from '../utils'
import paths from '../config/paths'

/**
 * @param htmlFilePath absolute file path
 */
// TODO: 支持 watch html 文件变化
export const prepareHtmlFile = (
  filePath: string = paths.defaultHtmlFileAbs,
  outDir: string
) => {
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
