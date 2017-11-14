const webpackRules = require('./rules')

/**
 * 
 * @param {object} config 
 * features: 'polyfill' | 'react' | 'sass' | 'compress' | 'node' | 'babel'
 * sassConfig: { ..., encapsulation, globalFileExt }
 */

function getBaseConfig(config) {
  const { features } = config
  const featureRuleMapping = {
    sass: 'sass',
    react: 'es',
    babel: 'es'
  }

  const hasFeature = name => {
    return features.includes(name)
  }

  const getFeatureConfig = name => {
    return features.find(f => {
      return f.name === name
    }) || {}
  }
  const getRules = () => {
    // const features2 = 
    const rules = features2.reduce((allRules, feature) => {
      const featureConfig = getFeatureConfig(feature)
      const ruleName = featureRuleMapping[feature]
  
      // if (feature === 'sass' || (feature.name && feature.name === 'sass')) {
      //   let rule
      //   if (featureConfig.encapsulation) {
      //     const encapRule = webpackRules[ruleName]()
      //     const globalRule = webpackRules[ruleName]
      //     rule = [encapRule, globalRule]
      //   }
      //   rule = webpackRules[ruleName](featureConfig)
      //   return allRules.concat(rule)
      // }
      
      if (ruleName) {
        const rule = webpackRules[ruleName](featureConfig)
        return [...allRules, ...rule]
      }
      return allRules
    }, [])
  }

  return {
    rules
  }
}

module.exports = getBaseConfig
