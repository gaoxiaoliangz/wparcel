const chalk = require('chalk').default

const print = {
  log(...args) {
    console.info.apply(null, Array.from(args)) // eslint-disable-line
  },
  info(...args) {
    console.info.apply(null, Array.from(args).map(arg => chalk.cyan(arg))) // eslint-disable-line
  },
  warn(...args) {
    console.warn.apply(null, Array.from(args).map(arg => chalk.yellow(arg))) // eslint-disable-line
  },
  error(...args) {
    // todo print trace
    console.error.apply(null, Array.from(args).map(arg => chalk.red(arg))) // eslint-disable-line
  }
}

module.exports = print
