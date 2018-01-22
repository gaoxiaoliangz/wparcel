const _ = require('lodash')
const path = require('path')
const fs = require('fs')
const colors = require('colors/safe')
const getLocalIP = require('./get-local-ip')
const print = require('./print')

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

const copyFileWithExistenceCheck = (src, target) => {
  if (!fs.existsSync(target)) {
    fs.copyFileSync(src, target)
    return true
  }
  print.warn(`${target} exists!`)
  return false
}

function endsWith(str1, str2) {
  if (str1.length < str2.length) {
    return false
  }
  return str1.indexOf(str2) === str1.length - str2.length
}

exports.resolveProject = resolveProject
exports.isDepInstalled = isDepInstalled
exports.mergeAnything = mergeAnything
exports.capFirstLetter = capFirstLetter
exports.getLocalIP = getLocalIP
exports.copyFileWithExistenceCheck = copyFileWithExistenceCheck
exports.endsWith = endsWith
exports.print = print
