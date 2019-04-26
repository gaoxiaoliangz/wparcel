#!/usr/bin/env node

const program = require('commander')
const runTask = require('../lib/runTask')
const buildTask = require('../lib/tasks/build')

program
  .version('0.1.0')
  .option('build', 'bundle js code')
  .option('-n --name [taskName]', 'name of the task')
  .option('-w, --watch', 'watch')
  .option('-c, --config', 'config file relative path')
  .option('--analysis', 'show webpack-bundle-analyzer')
  .parse(process.argv)

if (program.build) {
  runTask(buildTask, {
    name: program.taskName || 'build',
    argv: program,
    analysis: program.analysis,
  })
}
