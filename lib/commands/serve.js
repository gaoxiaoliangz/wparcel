const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const runTask = require('../task/runTask')
const serveTask = require('../task/built-in-tasks/serve')
const { resolveProject } = require('../utils')

const serve = () => {
  let requiredFiles = [
    'webpack.config.js',
    'dev-server.config.js'
  ].map(filename => resolveProject(filename))

  if (!checkRequiredFiles(requiredFiles)) {
    process.exit(1)
  }
  requiredFiles = requiredFiles.map(require)
  runTask(serveTask(...requiredFiles), {
    name: 'serve'
  })
    .catch((err) => {
      console.error(err.stack)
      process.exit(1)
    })
}

module.exports = serve
