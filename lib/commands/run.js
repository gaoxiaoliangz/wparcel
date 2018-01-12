const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const _ = require('lodash')
const { resolveProject } = require('../utils')
const runTask = require('../task/runTask')

const run = (argvFlow) => {
  const filename = argvFlow[1]
  const taskName = argvFlow[2]
  const taskFile = resolveProject(filename)
  if (!checkRequiredFiles([taskFile])) {
    process.exit(1)
  }

  const taskModule = require(taskFile)
  const taskFilename = _.last(taskFile.split('/')).split('.')[0]
  let taskFn

  if (typeof taskModule === 'function') {
    taskFn = taskModule
  } else if (taskName) {
    taskFn = taskModule[taskName]
  } else {
    taskFn = taskModule['default'] || taskModule[_.keys(taskModule)[0]]
  }

  if (!taskFn) {
    console.error('Error: Task not found!')
    process.exit(1)
  }

  runTask(taskFn, {
    name: taskName ? `${taskFilename}:${taskName}` : taskFilename
  })
    .catch((err) => {
      console.error(err.stack)
      process.exit(1)
    })
}

module.exports = run
