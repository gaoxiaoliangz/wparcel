import * as Rx from 'rxjs/Rx'
import clearConsole from 'react-dev-utils/clearConsole'
import { print } from './utils'

process.on('unhandledRejection', err => {
  throw err
})

const format = time => {
  return time.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1')
}

const printInfo = (label, info) => {
  const start = new Date()
  print.info(`[${format(start)}] ${label.toUpperCase()}`)
  print.log(info)
}

const taskStatus = {
  changeStart: 'change-start',
  changeComplete: 'change-complete',
}

class Timer {
  static calcSpan(t0, t1) {
    if (t0 && t1 && t0.getTime && t1.getTime) {
      return ((t1.getTime() - t0.getTime()) / 1000).toFixed(2)
    }
    return 'N/A'
  }

  running: boolean
  startTime: Date
  endTime: Date

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
const runTask = (taskFn, context) => {
  const { name, argv, ...rest } = context
  const printTaskInfo = printInfo.bind(null, name)
  const taskTimer = new Timer()
  const watchTimer = new Timer()

  taskTimer.start()

  const printStartInfo = () => {
    taskTimer.start()
    printTaskInfo(`Running ...`)
  }

  const handleTaskEnd = (result?: string) => {
    printTaskInfo(
      `Finished in ${taskTimer.end().span}s${result ? ', ' + result : ''}`
    )
  }

  try {
    const result = taskFn({
      Observable: Rx.Observable,
      taskStatus,
      argv,
      ...rest,
    })
    return new Promise(resolve => {
      printStartInfo()

      if (result instanceof Rx.Observable) {
        result.subscribe({
          next(v) {
            if (!argv.ncc) {
              clearConsole()
            }
            if (v === taskStatus.changeStart) {
              watchTimer.start()
              printTaskInfo('Changed ...')
            } else if (v === taskStatus.changeComplete) {
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
          },
        })
      } else if (result && result.then) {
        resolve(result.then(handleTaskEnd))
      } else {
        resolve(handleTaskEnd() as any)
      }
    })
  } catch (error) {
    return Promise.reject(error)
  }
}

export default runTask