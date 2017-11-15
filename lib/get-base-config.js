const _ = require('lodash')
const webpackRules = require('./rules')
const { isDepInstalled } = require('./utils')

const babelDep = ['babel-core', 'babel-loader', 'babel-plugin-lodash', 'babel-preset-es2015']
const cssDep = ['isomorphic-style-loader', 'css-loader']

const featureConfig = {
  polyfill: {
    dep: ['babel-polyfill']
  },
  react: {
    rule: 'babel',
    priority: 2,
    dep: [...babelDep, 'babel-preset-react']
  },
  typescript: {
    rule: 'typescript',
    priority: 1,
    dep: ['ts-loader']
  },
  sass: {
    rule: 'sass',
    priority: 1,
    dep: ['sass-loader', 'node-sass']
  },
  compress: {

  },
  node: {

  },
  babel: {
    rule: 'babel',
    priority: 1,
    dep: babelDep
  },
  postcss: {
    rule: 'css',
    priority: 2,
    defaultRuleConfig: {
      postcss: true,
    },
    dep: [...cssDep, 'postcss', 'postcss-cssnext', 'postcss-import', 'postcss-loader']
  },
  css: {
    rule: 'css',
    priority: 1,
    defaultRuleConfig: {
      postcss: false,
    },
    dep: cssDep
  }
}

const getDeps = features => {
  const enabled = _.pick(featureConfig, Object.keys(features))
  const deps = _.filter(enabled, f => f.dep)
    .map(feature => {
      return feature.dep
    })
  const deps2 = _.flatten(deps)
  return _.union(deps2)
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
 */
function getBaseConfig(config) {
  const { features } = config
  const deps = getDeps(features)

  const missingDeps = deps.filter(dep => {
    return !isDepInstalled(dep)
  })

  const hint = `Install missing deps by run 'yarn install ${missingDeps.join(' ')} --dev'`

  if (missingDeps.length !== 0) {
    console.error(hint)
    process.exit(1)
  }

  return {
    rules: createRules(features)
  }
}

module.exports = getBaseConfig
