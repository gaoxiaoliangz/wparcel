const { configWebpack, features, presets } = require('./config-webpack')
const { resolveProject, getLocalIP } = require('./utils')

exports.resolveProject = resolveProject
exports.getLocalIP = getLocalIP
exports.configWebpack = configWebpack
exports.features = features
exports.presets = presets
