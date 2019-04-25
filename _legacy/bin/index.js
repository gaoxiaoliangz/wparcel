#! /usr/bin/env node

const minimist = require('minimist')
const print = require('../lib/utils/print')

const argv = minimist(process.argv.slice(2))

const commands = {
  init: () => require('../lib/commands/init')(argv),
  run: () => require('../lib/commands/run')(argv),
  serve: () => require('../lib/commands/serve')(argv),
  build: () => require('../lib/commands/build')(argv),
}

if (argv._.length === 0) {
  if (argv.version || argv.v) {
    // --version, -v
    require('../lib/commands/version')()
  } else if (argv.help || argv.h) {
    // --help, -h
    require('../lib/commands/help')()
  } else {
    commands.build.call()
  }
} else if (commands[argv._[0]]) {
   commands[argv._[0]].call()
} else {
  print.error(`Unknown command ${argv._[0]}`)
}
