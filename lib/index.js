const { configWebpack, features } = require('./config-webpack')
const { resolveProject, getLocalIP } = require('./utils')

exports.resolveProject = resolveProject
exports.getLocalIP = getLocalIP
exports.configWebpack = configWebpack
exports.features = features
