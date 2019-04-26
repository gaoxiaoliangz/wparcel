const path = require('path')

module.exports = {
  entry: path.resolve('./src/index.js'),
  output: {
    libraryTarget: 'umd',
  },
}
