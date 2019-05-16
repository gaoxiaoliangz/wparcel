#!/usr/bin/env node
// @ts-check

const program = require('commander')
const build = require('../lib/tasks/build').default
const serve = require('../lib/tasks/serve').default
const handleTaskOutput = require('../lib/handleTaskOutput').default
// @ts-ignore
const pkg = require('../package.json')

program
  .version(pkg.version)
  .option('build', 'bundle app')
  .option('-w, --watch', 'enable watch mode for build')
  .option('-c, --config <config>', 'webpack config file path')
  .option('-a, --analysis', 'show bundle analysis')
  .option('-k, --keep-console', 'keep console output')
  .parse(process.argv)

if (program.build) {
  handleTaskOutput(
    build({
      watch: program.watch,
      analysis: program.analysis,
      configFilePath: program.configFilePath,
      entryFilePath: program.args[0],
    }),
    {
      taskName: 'Build',
      keepConsole: program.keepConsole,
    }
  )
} else {
  handleTaskOutput(
    serve({
      configFilePath: program.configFilePath,
      entryFilePath: program.args[0],
    }),
    {
      taskName: 'Serve',
      keepConsole: program.keepConsole,
    }
  )
}
