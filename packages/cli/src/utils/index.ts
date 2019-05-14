import _ from 'lodash'
import path from 'path'
import fs from 'fs'
import print from './print'

export { print }

export const formatTime = (time: Date) => {
  return time.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1')
}

export const capFirstLetter = word => {
  return word
    .split('')
    .map((w, i) => (i === 0 ? w.toUpperCase() : w))
    .join('')
}

export const isDepInstalled = dep => {
  try {
    require.resolve(resolvePathInProject(path.join('node_modules', dep)))
    return true
  } catch (error) {
    return false
  }
}

export const fileExists = relPath => {
  try {
    require.resolve(resolvePathInProject(relPath))
    return true
  } catch (error) {
    return false
  }
}

export function resolvePathInProject(relativePath) {
  // Make sure any symlinks in the project folder are resolved:
  // https://github.com/facebookincubator/create-react-app/issues/637
  const projectDir = fs.realpathSync(process.cwd())
  return path.resolve(projectDir, relativePath)
}

// merge objects with array without mutation
export const mergeAnything = (object, sources) => {
  if (Array.isArray(sources)) {
    return [...object, ...sources]
  }

  const object2 = _.cloneDeep(object)
  return _.mergeWith(object2, sources, (objValue, srcValue) => {
    if (_.isArray(objValue)) {
      return objValue.concat(srcValue)
    }
  })
}

export const copyFileWithExistenceCheck = (src, target) => {
  if (!fs.existsSync(target)) {
    fs.copyFileSync(src, target)
    return true
  }
  print.warn(`${target} exists!`)
  return false
}

export const getFirstExistingFile = chain => {
  for (const file of chain) {
    if (fileExists(file)) {
      return file
    }
  }
}

export const getFilename = (absFilePath: string) => {
  return path.basename(absFilePath)
}
