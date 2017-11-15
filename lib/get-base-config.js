const _ = require('lodash')
const webpackRules = require('./rules')

const featureConfig = {
  polyfill: {
  },
  react: {
    rule: 'babel',
    priority: 2,
  },
  sass: {
    rule: 'sass',
    priority: 1
  },
  compress: {

  },
  node: {

  },
  babel: {
    rule: 'babel',
    priority: 1,
  },
  postcss: {
    rule: 'css',
    priority: 2,
    defaultRuleConfig: {
      postcss: true,
    }
  },
  css: {
    rule: 'css',
    priority: 1,
    defaultRuleConfig: {
      postcss: false,
    }
  }
}

/**
 * @param {(string | {})[]} features
 * @return {{[rule: string]: { priority?: number, feature: { name: string, config: {} } }[]}[]}
 */
const getRuleConfig = features => {
  const featureNames = _.map(features, (v, k) => v ? k : undefined).filter(Boolean)
  const featureWithRule = _.map(featureNames, name => {
    const rule = _.get(featureConfig, [name, 'rule'])
    if (!rule) {
      return
    }
    return {
      feature: name,
      rule
    }
  })
    .filter(Boolean)

  const rules = _.groupBy(featureWithRule, feature => {
    return feature.rule
  })

  return _.mapValues(rules, ruleFeatures => {
    return ruleFeatures.map(f => {
      const featureName = f.feature
      return {
        priority: featureConfig[featureName].priority,
        feature: {
          name: featureName,
          config: typeof features[featureName] === 'object' ? features[featureName] : undefined
        }
      }
    })
  })
}

/**
 * @param {{[rule: string]: { priority?: number, feature: { name: string, config: {} } }[]}[]} features
 */
const createRules = features => {
  const rules = getRuleConfig(features)
  return _.reduce(rules, (allRules, ruleConfigs, ruleName) => {
    const ruleConfig = ruleConfigs.sort((r1, r2) => {
      return r1.priority - r2.priority
    })
      .map(rule => {
        return rule.feature.config
      })
      .reduce((finalConfig, config) => {
        return Object.assign({}, finalConfig, config)
      }, {})
    const webpackRule = webpackRules[ruleName](ruleConfig)
    return [...allRules, ..._.castArray(webpackRule)]
  }, [])
}

/**
 * @param {object} config 
 * features: 'polyfill' | 'react' | 'sass' | 'compress' | 'node' | 'babel' | 'postcss' | 'css' | 'typescript'
 * sassConfig: { ..., encapsulation, globalFileExt }
 */
function getBaseConfig(config) {
  const { features } = config

  return {
    rules: createRules(features)
  }
}

module.exports = getBaseConfig
