const _ = require('lodash')
const webpackMerge = require('webpack-merge')
const resolveApp = require('./resolve-app')
// todo
// const webpackValidator = require('webpack-validator')
const webpackRules = require('./rules')
const { isDepInstalled } = require('./utils')

const essDep = ['webpack']
const babelDep = ['babel-core', 'babel-loader', 'babel-plugin-lodash', 'babel-preset-es2015']
const cssDep = ['isomorphic-style-loader', 'css-loader', 'style-loader']

const isDebug = true
const isVerbose = true

const baseConfig = {
  resolve: {
    alias: {
      '@': resolveApp('src')
    },
    modules: [
      'node_modules'
    ],
    // todo
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs']
  },

  // Don't attempt to continue if there are any errors.
  bail: !isDebug,

  cache: isDebug,

  stats: {
    colors: true,
    reasons: isDebug,
    hash: isVerbose,
    version: isVerbose,
    timings: true,
    chunks: isVerbose,
    chunkModules: isVerbose,
    cached: isVerbose,
    cachedAssets: isVerbose
  }
}

const featureConfig = {
  polyfill: {
    dep: ['babel-polyfill']
  },
  react: {
    rule: 'babel',
    priority: 2,
    dep: [...babelDep, 'babel-preset-react', 'react', 'react-dom'],
    defaultRuleConfig: {
      babelrc: {
        presets: [
          'es2015',
          'react'
        ]
      }
    }
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
        const defaultRuleConfig = featureConfig[rule.feature.name].defaultRuleConfig || {}
        return _.merge({}, defaultRuleConfig, rule.feature.config)
      })
      .reduce((finalConfig, config) => {
        return Object.assign({}, finalConfig, config)
      }, {})

    const webpackRule = webpackRules[ruleName](ruleConfig)
    return [...allRules, ..._.castArray(webpackRule)]
  }, [])
}

/**
 * @param {{features: { [feature: string]: {} }}} config 
 * features: 'polyfill' | 'react' | 'sass' | 'compress' | 'node' | 'babel' | 'postcss' | 'css' | 'typescript'
 */
function getBaseConfig(config, webpackConfig) {
  const { features } = config
  const deps = getDeps(features)

  const missingDeps = [...deps, ...essDep].filter(dep => {
    return !isDepInstalled(dep)
  })

  const hint = `Install missing deps by run 'yarn add ${missingDeps.join(' ')} --dev'`

  if (missingDeps.length !== 0) {
    console.error(hint)
    process.exit(1)
  }

  const merged = webpackMerge({}, baseConfig, {
    module: {
      rules: createRules(features)
    }
  }, webpackConfig)

  // validate babel-polyfill
  if (features.polyfill) {
    if (!merged.entry) {
      console.error('Missing entry!')
      process.exit(1)
    }

    const hasPolyfill = _.find(merged.entry, paths => {
      if (typeof paths === 'string') {
        return paths.includes('babel-polyfill')
      }
      return paths.some(p => {
        return p.includes('babel-polyfill')
      })
    })
    if (!hasPolyfill) {
      console.error('WARNING: `babel-polyfill` should be placed in one of you entry config in order to work!')
    }
  }
  return merged
}

module.exports = getBaseConfig
