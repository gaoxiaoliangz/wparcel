const run = require('./run')

const commandServe = (argv) => {
  return run(Object.assign({}, argv, {
    _: ['run', 'serve.js']
  }))
}

module.exports = commandServe
