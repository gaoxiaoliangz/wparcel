const configWebpack = require('./config-webpack')
const Features = require('./features')

const features = Object.keys(Features)
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

const presets = {
  Production({ exclude = [] } = {}) {
    return [
      features.Md5Hash(),
      features.Compress(),
      features.ExtractCss()
    ]
      .filter(f => {
        return !exclude.includes(f.name)
      })
  }
}

exports.features = features
exports.configWebpack = configWebpack
exports.presets = presets
