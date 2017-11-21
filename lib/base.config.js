const { resolveApp } = require('./utils')

module.exports = ({ debug = true, verbose = false }) => ({
  resolve: {
    alias: {
      '@': resolveApp('src')
    },
    modules: [
      'node_modules'
    ],
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs']
  },

  // Don't attempt to continue if there are any errors.
  bail: !debug,

  cache: debug,

  stats: {
    colors: true,
    reasons: debug,
    hash: verbose,
    version: verbose,
    timings: true,
    chunks: verbose,
    chunkModules: verbose,
    cached: verbose,
    cachedAssets: verbose
  }
})
