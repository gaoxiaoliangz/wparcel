#!/usr/bin/env node
// @ts-check

const program = require('commander')
const build = require('../lib/tasks/build').default
const handleTaskOutput = require('../lib/handleTaskOutput').default

program
  .version('0.1.0')
  .option('build', 'bundle js code')
  .option('-w, --watch', 'enable watch mode')
  .option('-c, --config <config>', 'config file path')
  .option('--analysis', 'show webpack-bundle-analyzer')
  .parse(process.argv)

if (program.build) {
  handleTaskOutput(
    build({
      watch: program.watch,
      analysis: program.analysis,
      configFilePath: program.configFilePath,
    }),
    {
      taskName: 'Build',
    }
  )
}
