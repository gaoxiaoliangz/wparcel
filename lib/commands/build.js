const run = require('./run')

const commandBuild = (argv) => {
  return run(Object.assign({}, argv, {
    _: ['run', 'build.js']
  }))
}

module.exports = commandBuild
