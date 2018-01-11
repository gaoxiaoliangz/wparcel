#! /usr/bin/env node

const minimist = require('minimist')
const _ = require('lodash')
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const runTask = require('../lib/task/runTask')
const { resolveApp } = require('../lib/utils')
const serve = require('../lib/built-in-tasks/serve')

const COMMANDS = {
  RUN_TASK: 'runTask',
  SERVE: 'serve'
}

const argv = minimist(process.argv.slice(2))
const argvFlow = argv._

if (argvFlow[0] === COMMANDS.RUN_TASK) {
  const filename = argvFlow[1]
  const taskName = argvFlow[2]
  const taskFile = resolveApp(filename)
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
} else if (argvFlow[0] === COMMANDS.SERVE) {
  runTask(serve, {
    name: 'serve'
  })
    .catch((err) => {
      console.error(err.stack)
      process.exit(1)
    })
}
