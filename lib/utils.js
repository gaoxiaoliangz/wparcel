const path = require('path')
const fs = require('fs')

const not = v => !v

// todo
const compose = (...funcs) => {
  return (...args) => funcs.reduce((result, func, index) => {
    return index === 0
      ? func.apply(args)
      : func.call(result)
  })
}

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

exports.resolveApp = resolveApp
exports.isDepInstalled = isDepInstalled
