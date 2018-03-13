const configWebpack = require('./config-webpack')
const { resolveProject, getLocalIP } = require('./utils')

const PRESETS = {
  production: {
    md5Hash: {},
    compress: {},
    extractCss: {},
    production: true
  }
}

exports.resolveProject = resolveProject
exports.getLocalIP = getLocalIP
exports.configWebpack = configWebpack
exports.presets = PRESETS
