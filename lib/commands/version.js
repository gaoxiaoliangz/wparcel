const packageJSON = require('../../package.json')

module.exports = () => {
  console.log(packageJSON.version)
}
