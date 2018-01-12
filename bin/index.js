#! /usr/bin/env node

const minimist = require('minimist')

const argv = minimist(process.argv.slice(2))
const argvFlow = argv._

const commands = {
  init: () => require('../lib/commands/init')(argvFlow),
  run: () => require('../lib/commands/run')(argvFlow),
  serve: () => require('../lib/commands/serve')(argvFlow),
}

if (argvFlow.length === 0) {
  if (argv.version || argv.v) {
    // --version, -v
    require('../lib/commands/version')()
  } else if (argv.help || argv.h) {
    // --help, -h
    require('../lib/commands/help')()
  } else {
    console.log('Unknown command')
  }
} else {
  commands[argvFlow[0]] && commands[argvFlow[0]].call()
}
