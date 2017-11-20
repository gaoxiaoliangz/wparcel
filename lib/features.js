const _ = require('lodash')

class Feature {
  constructor(userConfig) {
    this.userConfig = userConfig
  }

  get config() {
    return _.merge({}, this.defaultConfig, this.userConfig[this.featureType])
  }
}

class RuleFeature extends Feature {
  constructor(userConfig) {
    super(userConfig)
  }

  convert() {

  }
}

class CommonFeature extends Feature {
  constructor(userConfig) {
    super(userConfig)
  }

  convert() {

  }
}

class Css extends RuleFeature {
  constructor(userConfig) {
    super(userConfig)
    this.defaultConfig = {
      scoped: false,
      sourceMap: true,
    }
    this.featureType = 'css'
  }

  eval() {
    return this.convert()
  }
}

const config = {
  css: {
    wtf: true,
  }
}

const css1 = new Css(config)

console.log(css1)
console.log(css1.config)

console.log(eval(1))

