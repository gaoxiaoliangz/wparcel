import path from 'path'
import fs from 'fs'
import paths from '../config/paths'
import { resolvePathInProject, getFilename } from '../utils'

export const prepareAssetFolder = (outDir: string) => {
  const destPath = path.resolve(resolvePathInProject(outDir), paths.assetFolder)
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath, {
      recursive: true,
    })
  }
  return destPath
}

/**
 * @param filePath absolute file path
 */
// TODO: add file hash
export const copyFileToAssetFolder = (filePath: string, outDir: string) => {
  const folderPath = resolvePathInProject(outDir, paths.assetFolder)
  const filename = getFilename(filePath)
  const destFilePathAbs = path.resolve(folderPath, filename)
  fs.copyFileSync(filePath, destFilePathAbs)
  return destFilePathAbs
}
