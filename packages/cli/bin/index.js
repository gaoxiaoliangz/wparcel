#!/usr/bin/env node
// @ts-check

const program = require('commander')
const build = require('../lib/tasks/build').default
const serve = require('../lib/tasks/serve').default
const handleTaskOutput = require('../lib/handleTaskOutput').default
// @ts-ignore
const pkg = require('../package.json')

const parseNumber = label => input => {
  const n = Number(input)
  if (!isNaN(n)) {
    return n
  }
  throw new TypeError(`${label} should be a number, "${input}" is invalid`)
}

program
  .option('build', 'bundle app')
  .version(pkg.version)
  .option('-w, --watch', 'enable watch mode for build')
  .option('-c, --config <value>', 'webpack config file path')
  .option('-a, --analysis', 'show bundle analysis')
  .option('-k, --keep-console', 'keep console output')
  .option('-p, --port <number>', 'webpack dev server port', parseNumber('port'))
  .option('-o, --open', 'open browser')
  .parse(process.argv)

if (program.build) {
  handleTaskOutput(
    build({
      watch: program.watch,
      analysis: program.analysis,
      configFilePath: program.config,
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
      configFilePath: program.config,
      entryFilePath: program.args[0],
      shouldOpenBrowser: program.open,
      port: program.port,
    }),
    {
      taskName: 'Serve',
      keepConsole: program.keepConsole,
    }
  )
}
