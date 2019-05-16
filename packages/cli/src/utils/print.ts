import chalk from 'chalk'

const makePrintFn = (colorFn?) => (...args) => {
  if (colorFn) {
    return console.log(...args.map(arg => colorFn(arg)))
  }
  return console.log(...args)
}

const print = {
  log: makePrintFn(),
  info: makePrintFn(chalk.cyan),
  warn: makePrintFn(chalk.yellow),
  error: makePrintFn(chalk.red),
}

export default print
