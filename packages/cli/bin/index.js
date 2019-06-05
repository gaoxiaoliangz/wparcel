#!/usr/bin/env node
// @ts-check

const isDebug = process.argv.includes('--debug')

const timeLog = []

const logTime = desc => {
  if (!isDebug) {
    return
  }
  const t = new Date()
  const tStr = `${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}:${t.getMilliseconds()}`
  const lastT = timeLog[timeLog.length - 1]
  const span = ((lastT ? t.valueOf() - lastT[0].valueOf() : 0) / 1000).toFixed(2) // prettier-ignore
  const log = [t, desc]
  timeLog.push(log)
  console.log(tStr, desc, '+' + span + 's')
}

const sumTime = () => {
  if (!isDebug) {
    return
  }
  const delta =
    timeLog[timeLog.length - 1][0].valueOf() - timeLog[0][0].valueOf()
  const s = delta / 1000
  console.log(`It takes ${s}s to complete`)
}

logTime('before imports')

const program = require('commander')
logTime('after importing commander')
const build = require('../lib/tasks/build').default
logTime('after importing task/build')
const serve = require('../lib/tasks/serve').default
logTime('after importing task/serve')
const handleTaskOutput = require('../lib/handleTaskOutput').default
logTime('after importing lib/handleTaskOutput')
// @ts-ignore
const pkg = require('../package.json')
logTime('after importing package.json')

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

logTime('after registering commands')

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

logTime('after handleTaskOutput called')
sumTime()
