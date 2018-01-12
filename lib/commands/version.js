const packageJSON = require('../../package.json')
// todo
console.log('version loaded')
module.exports = () => {
  console.log(packageJSON.version)
}
