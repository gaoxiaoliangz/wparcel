import path from 'path'
import { resolvePathInProject, print } from '../utils'
import { prepareHtmlFile } from './html'

interface HandleEntryOptions {
  webpackEnv: WebpackEnv
  outDir: string | null
}

export const handleEntry = (
  entryFilePath: string,
  options: HandleEntryOptions
): {
  htmlFilePathAbs: string
  entry: any
} => {
  const { webpackEnv, outDir } = options
  const isDevEnv = webpackEnv === 'development'
  let entryFilePathAbs = entryFilePath
  if (!path.isAbsolute(entryFilePath)) {
    entryFilePathAbs = resolvePathInProject(entryFilePath)
  }

  let htmlFilePathAbs: string
  let webpackEntry
  if (entryFilePathAbs.endsWith('.html')) {
    const { htmlPath, entry } = prepareHtmlFile({
      htmlPathAbs: entryFilePathAbs,
      outDir,
      isDevEnv,
    })
    if (!entry) {
      print.warn(`no entry was found in ${entryFilePathAbs}`)
    }
    htmlFilePathAbs = htmlPath
    webpackEntry = entry
  } else {
    webpackEntry = entryFilePathAbs
  }

  return {
    htmlFilePathAbs,
    entry: webpackEntry,
  }
}
