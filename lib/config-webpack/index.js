const configWebpack = require('./config-webpack')
const Features = require('./features')

exports.features = Object.keys(Features)
  .filter(key => key !== 'Feature')
  .reduce((obj, key) => {
    return Object.assign({}, obj, {
      [key]: userConfig => {
        return {
          userConfig,
          feature: key
        }
      }
    })
  }, {})

exports.configWebpack = configWebpack
