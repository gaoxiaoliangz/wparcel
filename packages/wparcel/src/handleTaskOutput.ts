import Rx from 'rxjs/Rx'
import clearConsole from 'react-dev-utils/clearConsole'
import { print } from './utils'
import { TASK_STATUS } from './constants'

process.on('unhandledRejection', err => {
  throw err
})

const printWithTaskName = taskName => (...args) => {
  // TODO: 用背景色
  print.info(`[${taskName}]`, ...args)
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
  taskName: string
}

const defaultConfig: Partial<OutputConfig> = {
  keepConsole: true,
}

const handleTaskOutput = async (taskOutput, config: OutputConfig) => {
  const finalConfig = {
    ...defaultConfig,
    ...config,
  }
  const { keepConsole, taskName } = finalConfig
  const taskPrint = printWithTaskName(taskName)
  const taskTimer = new Timer()
  const watchTimer = new Timer()

  taskTimer.start()

  const printStartInfo = () => {
    taskTimer.start()
    taskPrint(`started ...`)
  }

  const handleTaskEnd = (result?: string) => {
    if (result) {
      print.log(result)
    }
    taskPrint(`finished in ${taskTimer.end().span}s`)
  }

  const handleError = error => {
    print.error(error)
    process.exit(1)
  }

  try {
    printStartInfo()

    if (taskOutput instanceof Rx.Observable) {
      taskOutput.subscribe({
        next(action) {
          const { type, payload } = action
          if (!keepConsole) {
            clearConsole()
          }

          switch (type) {
            case TASK_STATUS.CHANGE_START:
              watchTimer.start()
              taskPrint('changed...')
              break

            case TASK_STATUS.CHANGE_ERROR:
              print.error(payload || 'Unknown error occurred')
              break

            case TASK_STATUS.CHANGE_COMPLETE:
              let span = watchTimer.end().span
              if (span === 'N/A') {
                span = Timer.calcSpan(taskTimer.startTime, watchTimer.endTime)
              }

              if (payload) {
                print.log(payload)
              }
              taskPrint(`change completed in ${span}s`)
              break

            default:
              print.warn(`Invalid task status: ${type}`)
              break
          }
        },
        complete() {
          handleTaskEnd()
        },
        error(error) {
          handleError(error)
        },
      })
      return
    }

    const then = taskOutput && taskOutput.then
    if (typeof then === 'function') {
      then.call(taskOutput, handleTaskEnd, handleError)
      return
    }

    handleTaskEnd()
  } catch (error) {
    handleError(error)
  }
}

export default handleTaskOutput
