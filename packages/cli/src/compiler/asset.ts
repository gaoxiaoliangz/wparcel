import path from 'path'
import fs from 'fs'
import paths, { folders } from '../config/paths'
import { resolvePathInProject, getFilename } from '../utils'

export const prepareAssetFolder = (outDir: string) => {
  const destPath = path.resolve(resolvePathInProject(outDir), folders.assets)
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath, {
      recursive: true,
    })
    console.log('asset folder created at', destPath)
  } else {
    console.log('asset folder already exists')
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
