const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const _ = require('lodash')
const path = require('path')
const { resolveProject, print } = require('../utils')
const runTask = require('../task/runTask')

const builtInTasks = ['serve.js', 'build.js']

const run = (argv) => {
  const filename = argv._[1]
  const taskName = argv._[2]
  let taskFile = resolveProject(filename)

  if (builtInTasks.includes(filename)) {
    taskFile = path.resolve(__dirname, '../task/built-in-tasks', filename)
  } else if (!checkRequiredFiles([taskFile])) {
    process.exit(1)
  }

  const taskModule = require(taskFile)
  const taskFilename = _.last(taskFile.split('/')).split('.')[0]
  let taskFn

  if (taskName) {
    taskFn = taskModule[taskName]
  } else if (typeof taskModule === 'function') {
    taskFn = taskModule
  } else {
    taskFn = taskModule['default'] || taskModule[_.keys(taskModule)[0]]
  }

  if (!taskFn) {
    print.error('Error: Task not found!')
    process.exit(1)
  }

  runTask(taskFn, {
    name: taskName ? `${taskFilename}:${taskName}` : taskFilename,
    argv
  })
    .catch((err) => {
      print.error(err.stack)
      process.exit(1)
    })
}

module.exports = run
