import path from 'path'
import fs from 'fs'
import { folders } from '../config/paths'
import mkdirp from 'mkdirp'
import { resolvePathInProject, getFilename } from '../utils'

export const prepareAssetFolder = (outDir: string) => {
  const destPath = path.resolve(resolvePathInProject(outDir), folders.assets)
  if (!fs.existsSync(destPath)) {
    // 低版本 node 会出现问题, zeit 的 8.x 就是
    // fs.mkdirSync(destPath, {
    //   recursive: true,
    // })
    mkdirp.sync(destPath)
  }
  return destPath
}

/**
 * @param filePath absolute file path
 */
// TODO: add file hash
export const copyFileToAssetFolder = (filePath: string, outDir: string) => {
  const folderPath = resolvePathInProject(outDir, folders.assets)
  const filename = getFilename(filePath)
  const destFilePathAbs = path.resolve(folderPath, filename)
  fs.copyFileSync(filePath, destFilePathAbs)
  return destFilePathAbs
}
