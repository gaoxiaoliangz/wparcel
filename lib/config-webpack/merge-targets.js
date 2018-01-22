const _ = require('lodash')
const { endsWith, mergeAnything } = require('../utils')

function accessObjectByPath(obj, path) {
  const paths = Array.isArray(path) ? path : path.split('.')
  let current = obj
  paths.forEach(p => {
    current = current[p]
  })
  return current
}

exports.accessObjectByPath = accessObjectByPath

function targetToObject(target, value) {
  const obj = {}
  const keys = target.split('.')
  keys.forEach((key, index) => {
    const current = accessObjectByPath(obj, keys.slice(0, index))
    if (index !== keys.length - 1) {
      current[key] = {}
    } else if (endsWith(key, '[]')) {
      const key2 = key.split('[]')[0]
      current[key2] = [value]
    } else if (endsWith(key, '{}')) {
      const key2 = key.split('{}')[0]
      current[key2] = value
    } else {
      current[key] = value
    }
  })
  return obj
}

exports.targetToObject = targetToObject

function mergeTargets(targets) {
  return targets
    .sort((a, b) => {
      return a.priority - b.priority
    })
    .reduce((result, target) => {
      return mergeAnything(result, targetToObject(target.target, target.value))
    }, {})
}

exports.mergeTargets = mergeTargets
