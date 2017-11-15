const { resolveApp } = require('./utils')

const isDebug = true
const isVerbose = true

module.exports = {
  resolve: {
    alias: {
      '@': resolveApp('src')
    },
    modules: [
      'node_modules'
    ],
    // todo
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs']
  },

  // Don't attempt to continue if there are any errors.
  bail: !isDebug,

  cache: isDebug,

  stats: {
    colors: true,
    reasons: isDebug,
    hash: isVerbose,
    version: isVerbose,
    timings: true,
    chunks: isVerbose,
    chunkModules: isVerbose,
    cached: isVerbose,
    cachedAssets: isVerbose
  }
}
