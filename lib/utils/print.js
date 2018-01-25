const chalk = require('chalk').default

const print = {
  log(...args) {
    console.info.apply(null, Array.from(args))
  },
  info(...args) {
    console.info.apply(null, Array.from(args).map(arg => chalk.cyan(arg)))
  },
  warn(...args) {
    console.warn.apply(null, Array.from(args).map(arg => chalk.yellow(arg)))
  },
  error(...args) {
    // todo print trace
    console.error.apply(null, Array.from(args).map(arg => chalk.red(arg)))
  }
}

module.exports = print
