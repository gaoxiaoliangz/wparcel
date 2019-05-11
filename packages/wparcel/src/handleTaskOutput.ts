import * as Rx from 'rxjs/Rx'
import clearConsole from 'react-dev-utils/clearConsole'
import { print } from './utils'
import { TASK_STATUS } from './constants'

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

interface OutputConfig {
  keepConsole?: boolean
}

const defaultConfig: OutputConfig = {
  keepConsole: true,
}

const handleTaskOutput = (taskOutput, config?: OutputConfig) => {
  const finalConfig = {
    ...defaultConfig,
    ...config,
  }
  const { keepConsole } = finalConfig
  const printTaskInfo = printInfo.bind(null, 'build')
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
    const result = taskOutput
    return new Promise(resolve => {
      printStartInfo()

      if (result instanceof Rx.Observable) {
        result.subscribe({
          next(v) {
            if (!keepConsole) {
              clearConsole()
            }
            if (v === TASK_STATUS.CHANGE_START) {
              watchTimer.start()
              printTaskInfo('Changed ...')
            } else if (v === TASK_STATUS.CHANGE_COMPLETE) {
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

export default handleTaskOutput
