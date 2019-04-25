const packageJSON = require('../../package.json')
const print = require('../utils/print')

module.exports = () => {
  print.log(packageJSON.version)
}
