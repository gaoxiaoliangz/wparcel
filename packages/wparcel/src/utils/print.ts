import chalk from 'chalk'

const makePrintFn = (colorFn?) => (...args) => {
  if (colorFn) {
    return console.log(...args.map(arg => colorFn(arg)))
  }
  return console.log(...args)
}

// const print2 = {
//   log(...args) {
//     console.info.apply(null, Array.from(args))
//   },
//   info(...args) {
//     console.info.apply(null, Array.from(args).map(arg => chalk.cyan(arg)))
//   },
//   warn(...args) {
//     console.warn.apply(null, Array.from(args).map(arg => chalk.yellow(arg)))
//   },
//   error(...args) {
//     if (args[0] instanceof Error) {
//       const err = args[0]
//       console.error(chalk.red(err.stack))
//       return
//     }
//     console.error.apply(null, Array.from(args).map(arg => chalk.red(arg)))
//   },
// }

const print = {
  log: makePrintFn(),
  info: makePrintFn(chalk.cyan),
  warn: makePrintFn(chalk.yellow),
  error: makePrintFn(chalk.red),
}

export default print
