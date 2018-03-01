const Rx = require('rxjs/Rx')
const clearConsole = require('react-dev-utils/clearConsole')
const { print } = require('../utils')

process.on('unhandledRejection', err => {
  throw err
})

const format = (time) => {
  return time.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1')
}

const printInfo = (label, info) => {
  const start = new Date()
  print.info(`${format(start)} Task:${label}`)
  print.log(info)
}

const taskStatus = {
  changeStart: 'change-start',
  changeComplete: 'change-complete'
}

class Timer {
  static calcSpan(t0, t1) {
    if (t0 && t1 && t0.getTime && t1.getTime) {
      return ((t1.getTime() - t0.getTime()) / 1000).toFixed(2)
    }
    return 'N/A'
  }

  constructor() {
    this.running = false
  }

  get span() {
    return Timer.calcSpan(this.startTime, this.endTime)
  }

  start() {
    this.running = true
    this.startTime = new Date()
    return this
  }

  end() {
    this.running = false
    this.endTime = new Date()
    return this
  }
}

/**
 * @param {Function} taskFn 
 * @param {{ name: String, argv: { ncc: Boolean } }} context 
 */
function runTask(taskFn, context) {
  const { name, argv } = context
  const printTaskInfo = printInfo.bind(null, name)
  const taskTimer = new Timer()
  const watchTimer = new Timer()

  taskTimer.start()

  const printStartInfo = () => {
    taskTimer.start()
    printTaskInfo(`Task running ...`)
  }

  const handleTaskEnd = result => {
    printTaskInfo(`Task finished in ${taskTimer.end().span}s${result ? ', ' + result : ''}`)
    return result
  }

  try {
    const result = taskFn({
      Observable: Rx.Observable,
      taskStatus,
      argv
    })
    return new Promise(resolve => {
      printStartInfo()

      if (result instanceof Rx.Observable) {
        result
          .subscribe({
            next(v) {
              if (v === taskStatus.changeStart) {
                watchTimer.start()
                printTaskInfo('Changed ...')
              } else if (v === taskStatus.changeComplete) {
                if (!argv.ncc) {
                  clearConsole()
                }
                let span = watchTimer.end().span
                if (span === 'N/A') {
                  span = Timer.calcSpan(taskTimer.startTime, watchTimer.endTime)
                }
                printTaskInfo(`Change completed in ${span}s`)
              } else {
                print.warn(`Invalid task status: ${v}`)
              }
            },
            complete() {
              handleTaskEnd()
            }
          })
      } else if (result && result.then) {
        resolve(result.then(handleTaskEnd))
      } else {
        resolve(handleTaskEnd(result))
      }
    })
  } catch (error) {
    return Promise.reject(error)
  }
}

module.exports = runTask
