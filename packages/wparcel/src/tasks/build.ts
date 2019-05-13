import Rx from 'rxjs/Rx'
import { TASK_STATUS } from '../constants'
import { toErrorOutputString, toOutputString } from '../helpers/helpers'
import { initCompiler } from '../helpers/webpack'

// const CONFIG_FALLBACK_CHAIN = [
//   'webpack.config.prod.js',
//   'webpack.config.js',
//   'webpack.config.dev.js',
// ]

interface BuildConfig {
  analysis: boolean
  configFilePath: string
  watch: boolean
  entryFilePath: string
}

const build = (config: BuildConfig) => {
  const { analysis, configFilePath, watch, entryFilePath } = config
  const { compiler } = initCompiler({
    configFilePath,
    analysis,
    webpackEnv: 'production',
    entryFilePath,
  })

  if (watch) {
    return Rx.Observable.create(observer => {
      compiler.hooks.done.tap('invalid', () => {
        observer.next({
          type: TASK_STATUS.CHANGE_START,
        })
      })
      compiler.watch(
        {
          aggregateTimeout: 300,
          poll: false,
        },
        (err, stats) => {
          if (err || stats.hasErrors()) {
            observer.next({
              type: TASK_STATUS.CHANGE_ERROR,
              payload: toErrorOutputString(stats),
            })
          } else {
            observer.next({
              type: TASK_STATUS.CHANGE_COMPLETE,
            })
          }
        }
      )
    })
  }

  return new Promise((resolve, reject) => {
    return compiler.run((err, stats) => {
      if (err) {
        return reject(err)
      }
      const hasError = stats.hasErrors()
      // TODO: 是否需要特殊处理？
      // const hasWarning = stats.hasWarnings()
      if (hasError) {
        return reject(toErrorOutputString(stats))
      }
      return resolve(toOutputString(stats))
    })
  })
}

export default build
