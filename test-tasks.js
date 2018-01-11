const rxjs = require('rxjs')

exports.task0 = () => {
  return 'simple sync task'
}

exports.task1 = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('async task')
    }, 1000)
  })
}

exports.task2 = ({ Observable, taskStatus }) => {
  return Observable.create(observer => {
    let count = 0
    const id = setInterval(() => {
      if (count === 3) {
        clearInterval(id)
        observer.complete()
      } else {
        observer.next(taskStatus.changeStart)
        setTimeout(() => {
          observer.next(taskStatus.changeComplete)
          count++
        }, 1000)
      }
    }, 1000)
  })
}
