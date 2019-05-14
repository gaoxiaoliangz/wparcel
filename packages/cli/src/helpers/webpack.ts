import path from 'path'



import { print, resolvePathInProject, getFilename } from '../utils'
import jsdom from 'jsdom'
import fs from 'fs'
import paths from '../config/paths'


const prepareCacheFolder = (webpackEnv: WebpackEnv) => {
  const destPath = webpackEnv === 'development' ?  path.resolve(paths.bui paths.assetFolder)
    // paths.appCacheStaticAbs
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
