const path = require('path')
const fs = require('fs')
const colors = require('colors/safe')
const getLocalIP = require('./getLocalIP')

const capFirstLetter = word => {
  return word.split('').map((w, i) => i === 0 ? w.toUpperCase() : w).join('')
}

const isDepInstalled = dep => {
  try {
    require.resolve(resolveProject(path.join('node_modules', dep)))
    return true
  } catch (error) {
    return false
  }
}


function resolveProject(relativePath) {
  // Make sure any symlinks in the project folder are resolved:
  // https://github.com/facebookincubator/create-react-app/issues/637
  const projectDir = fs.realpathSync(process.cwd())
  return path.resolve(projectDir, relativePath)
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

const copyFileWithExistenceCheck = (src, target) => {
  if (!fs.existsSync(target)) {
    fs.copyFileSync(src, target)
  } else {
    console.warn(`${target} exists!`)
  }
}

exports.resolveProject = resolveProject
exports.isDepInstalled = isDepInstalled
exports.mergeAnything = mergeAnything
exports.printErrorAndExit = printErrorAndExit
exports.printWarning = printWarning
exports.capFirstLetter = capFirstLetter
exports.getLocalIP = getLocalIP
exports.copyFileWithExistenceCheck = copyFileWithExistenceCheck
