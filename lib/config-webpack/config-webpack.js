const _ = require('lodash')
const webpackMerge = require('webpack-merge')
const baseConfig = require('./webpack.base.config')
const Features = require('./features')
const { essDep } = require('./constants')
const { isDepInstalled, print, mergeAnything, capFirstLetter, resolveProject, copyFileWithExistenceCheck } = require('../utils')
const ruleUtils = require('./rules')
const { mergeTargets } = require('./merge-targets')

const getDeps = features => {
  const deps = _.reduce(features, (deps, f) => {
    return [...deps, ...f.instance.dependency || []]
  }, [])
  return _.union(deps)
}

/**
 * validate features
 * @param {*} features feature instances
 */
const validateFeatures = features => {
  const deps = getDeps(features)
  const missingDeps = [...deps, ...essDep].filter(dep => {
    return !isDepInstalled(dep)
  })
  const hint = `Some packages are not installed, install these packages by running\n\nyarn add ${missingDeps.join(' ')} --dev\n`

  if (missingDeps.length !== 0) {
    print.error(hint)
    process.exit(0)
  }

  if (features.find(f => f.key === 'typescript')) {
    try {
      require.resolve(resolveProject('tsconfig.json'))
    } catch (error) {
      print.error('When enabling typescript, tsconfig.json is required!\nYou can use `jellyweb init --ts` to generate one')
      process.exit(0)
    }
  }
}

/**
 * generate webpack config
 * @param {Object[]} features 
 * @param {Object} webpackConfig
 * @param {Object} webpackConfig.entry
 * @param {Object} webpackConfig.output
 * @param {String} webpackConfig.output.filename
 * @param {String} webpackConfig.output.path
 * @param {'source-map' | 'inline-source-map'} webpackConfig.devtool
 */
function configWebpack(features, webpackConfig) {
  if (!Array.isArray(features)) {
    print.error('configWebpack: `Features` should be an array!')
    process.exit(0)
  }

  // feature instances, eg: { name: 'Css': instance: {...} }
  const features2 = _.flatten(features)
    .map(feature => {
      const Feature = Features[feature.feature]
      if (!Feature) {
        print.error(`Invalid feature '${feature.feature}'`)
        process.exit(0)
      }
      return {
        instance: new Feature({
          userConfig: feature.userConfig,
          features
        }),
        name: feature.feature
      }
    })
  
  // if not passed process terminates
  validateFeatures(features2)
  
  const targets = _.flatten(features2.map(({ instance }) => instance.eval()))
  const webpackConfig0 = mergeTargets(targets)
  const merged = webpackMerge({}, baseConfig({
    verbose: false,
    debug: true,
  }), webpackConfig0, webpackConfig)

  const fileRule = _.find(merged.module.rules, { __type: 'file' })
  const removeRuleType = r => _.omit(r, ['__type'])

  if (fileRule) {
    merged.module.rules = [{
      oneOf: [
        ...merged.module.rules.filter(rule => rule.__type !== 'file'),
        ...[fileRule]
      ]
        .map(removeRuleType)
    }]
  } else {
    merged.module.rules = merged.module.rules.map(removeRuleType)
  }
  return merged
}

module.exports = configWebpack
