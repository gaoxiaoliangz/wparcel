const rimraf = require('rimraf') // eslint-disable-line

/**
 * @param targets string[]
 */
function clean(targets) {
  return Promise
    .all(targets.map((target) => {
      return new Promise((resolve) => {
        rimraf(target, () => {
          resolve(target)
        })
      })
    }))
    .then((_targets) => {
      console.info(`Removed ${_targets.join(', ')}`)
    })
}

export default clean
