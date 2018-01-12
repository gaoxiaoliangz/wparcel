#! /usr/bin/env node

const fs = require('fs')
const path = require('path')
const minimist = require('minimist')
const _ = require('lodash')
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const runTask = require('../lib/task/runTask')
const { resolveApp } = require('../lib/utils')

const COMMANDS = {
  INIT: 'init',
  RUN_TASK: 'runTask',
  SERVE: 'serve',
  EJECT: 'eject'
}

const argv = minimist(process.argv.slice(2))
const argvFlow = argv._

const copyFileWithExistenceCheck = (src, target) => {
  if (!fs.existsSync(target)) {
    fs.copyFileSync(src, target)
  } else {
    console.warn(`${target} exists!`)
  }
}

const scripts = {
  [COMMANDS.INIT]() {
    const filesToCopy = ['dev-server.config.js', 'webpack.config.js']
    filesToCopy.forEach(filename => {
      const src = path.resolve(__dirname, `../lib/boilerplate/${filename}`)
      const target = resolveApp(filename)
      copyFileWithExistenceCheck(src, target)
    })

    const hint = `
    Next
    1. Create a index.js in src folder
    2. Create index.html in root, and include '/static/main.js' in script
    3. run 'jellyweb serve'
    `
    console.info('Init complete')
    console.info(hint)
  },
  [COMMANDS.RUN_TASK]() {
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
  },
  [COMMANDS.SERVE]() {
    let requiredFiles = ['webpack.config.js', 'dev-server.config.js'].map(filename => resolveApp(filename))
    if (!checkRequiredFiles(requiredFiles)) {
      process.exit(1)
    }
    requiredFiles = requiredFiles.map(require)
    runTask(require('../lib/built-in-tasks/serve/serve')(...requiredFiles), {
      name: 'serve'
    })
      .catch((err) => {
        console.error(err.stack)
        process.exit(1)
      })
  }
}

scripts[argvFlow[0]] && scripts[argvFlow[0]]()
