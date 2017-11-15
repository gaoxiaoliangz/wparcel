const _ = require('lodash')
const webpackRules = require('./rules')

/**
 * 
 * @param {object} config 
 * features: 'polyfill' | 'react' | 'sass' | 'compress' | 'node' | 'babel' | 'postcss' | 'css' | 'typescript'
 * sassConfig: { ..., encapsulation, globalFileExt }
 */

// // postcss, css
// // babel, react
// const featureToRule = [
//   [['sass'], 'sass'],
//   [['typescript'], 'typescript'],
//   [['react', 'babel'], 'babel'],
//   [['css', 'postcss'], 'css']
// ]

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
  // return featureToRule
  //   .map(m => {
  //     const features2 = m[0].filter(f => featureNames.includes(f))
  //     if (features2.length === 0) {
  //       return
  //     }
  //     return [features2, m[1]]
  //   })
  //   .filter(Boolean)

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

  return _.mapValues(rules, features => {
    return features.map(f => {
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

const createRules = features => {
  const rules = getRuleConfig(features)
  return _.reduce(rules => (allRules, ruleConfigs, ruleName) => {
    const ruleConfig = ruleConfigs.sort((r1, r2) => {
      return r1.priority - r2.priority
    })
      .reduce((finalConfig, config) => {
        return Object.assign({}, finalConfig, config)
      }, {})
    const webpackRule = webpackRules[ruleName](ruleConfig)
    return [...allRules, ...webpackRule]
  }, [])
}

const not = v => !v
const compose = (...funcs) => {
  return (...args) => funcs.reduce((result, func, index) => {
    return index === 0
      ? func.apply(args)
      : func.call(result)
  })
}

function getBaseConfig(config) {
  const { features } = config


  const hasFeature = name => {
    return features.includes(name)
  }

  const isFeature = feature => name => {
    return feature === name || (feature.name && feature.name === name)
  }

  // const getFeatureConfig = name => {
  //   return features.find(f => {
  //     return f.name === name
  //   }) || {}
  // }
  const getRules = () => {
    // const rules = features
    //   // todo
    //   .filter(compose(isFeature('react'), not))
    //   .reduce((allRules, feature) => {
    //     const featureConfig = getFeatureConfig(feature)
    //     const ruleName = featureRuleMapping[feature]

    //     // if (feature === 'sass' || (feature.name && feature.name === 'sass')) {
    //     //   let rule
    //     //   if (featureConfig.encapsulation) {
    //     //     const encapRule = webpackRules[ruleName]()
    //     //     const globalRule = webpackRules[ruleName]
    //     //     rule = [encapRule, globalRule]
    //     //   }
    //     //   rule = webpackRules[ruleName](featureConfig)
    //     //   return allRules.concat(rule)
    //     // }

    //     if (ruleName) {
    //       const rule = webpackRules[ruleName](featureConfig)
    //       return [...allRules, ...rule]
    //     }
    //     return allRules
    //   }, [])
    const rules = []

    _.forEach(webpackRules, (ruleFn, ruleName) => {
      switch (ruleName) {
        case 'sass':
          hasFeature('sass')
          const featureConfig = getFeatureConfig('sass')
          rule = ruleFn(featureConfig)
          rules.push(rule)
          break



        default:
          break
      }
    })
  }

  return {
    rules: createRules(features)
  }
}

module.exports = getBaseConfig
