const path = require('path')
const fs = require('fs')
const colors = require('colors/safe')

const isDepInstalled = dep => {
  try {
    require.resolve(resolveApp(path.join('node_modules', dep)))
    return true
  } catch (error) {
    return false
  }
}

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd())

function resolveApp(relativePath) {
  return path.resolve(appDirectory, relativePath)
}

// merge objects with array without mutation
const mergeAnything = (object, sources) => {
  if (typeof sources !== 'object') {
    return sources
  }

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

const printErrorAndExit = (msg, exit = true) => {
  console.error(colors.red(`ERROR: ${msg}`))
  if (exit) {
    process.exit(0)
  }
}

const printWarning = msg => {
  console.warn(colors.yellow(`WARNING: ${msg}`))
}

exports.resolveApp = resolveApp
exports.isDepInstalled = isDepInstalled
exports.mergeAnything = mergeAnything
exports.printErrorAndExit = printErrorAndExit
exports.printWarning = printWarning
