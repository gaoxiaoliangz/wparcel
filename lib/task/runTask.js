const _ = require('lodash')
const Rx = require('rxjs/Rx')
const chalk = require('chalk').default
const clearConsole = require('react-dev-utils/clearConsole')

const format = (time) => {
  return time.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1')
}

const printInfo = (label, info) => {
  start = new Date()
  console.info(`${chalk.white.bgBlack(` ${format(start)} ${label} `)} ${info}`, )
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

function runTask(taskFn, { name, context }) {
  const printTaskInfo = printInfo.bind(null, name)
  const taskTimer = new Timer()
  const watchTimer = new Timer()

  taskTimer.start()

  const printStartInfo = info => {
    taskTimer.start()
    printTaskInfo(`Task running ...`)
  }

  const handleTaskEnd = result => {
    printTaskInfo(`Task finished in ${taskTimer.end().span}s${result ? ', ' + result : ''}`)
    return result
  }

  try {
    const result = taskFn(_.assign({}, context, {
      Observable: Rx.Observable,
      taskStatus
    }))
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
                clearConsole()
                let span = watchTimer.end().span
                if (span === 'N/A') {
                  span = Timer.calcSpan(taskTimer.startTime, watchTimer.endTime)
                }
                printTaskInfo(`Change completed in ${span}s`)
              } else {
                console.log(`Invalid task status: ${v}`)
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
