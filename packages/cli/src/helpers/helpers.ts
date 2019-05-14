import path from 'path'

export const resolvePackagePath = relPath =>
  path.resolve(process.cwd(), relPath)

export const toOutputString = (stats, config?) => {
  return stats.toString(
    config || {
      colors: true,
    }
  )
}

export const toErrorOutputString = stats => {
  return stats.toString('errors-only')
}
