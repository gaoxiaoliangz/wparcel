const _ = require('lodash')
const webpackMerge = require('webpack-merge')
const Features = require('./features')
const { essDep } = require('./constants')
const { isDepInstalled, printErrorAndExit, printWarning, mergeAnything } = require('./utils')
const ruleUtils = require('./rules')

const getDeps = features => {
  const deps = _.reduce(features, (deps, f) => {
    return [...deps, ...f.dependency]
  }, [])
  return _.union(deps)
}

const validateUserConfig = (features, userConfig) => {
  if (userConfig.disableDepCheck) {
    return
  }

  const deps = getDeps(features)
  const missingDeps = [...deps, ...essDep].filter(dep => {
    return !isDepInstalled(dep)
  })
  const hint = `Some packages are not installed, install these packages by running\n\nyarn add ${missingDeps.join(' ')} --dev\n`

  if (missingDeps.length !== 0) {
    printErrorAndExit(hint)
  }

  if (features.find(f => f.key === 'typescript')) {
    try {
      require.resolve(resolveApp('tsconfig.json'))
    } catch (error) {
      printErrorAndExit('When enabling typescript tsconfig.json is requierd! You can use the following config as a template', false)
      console.log(exampleTsconfig)
      process.exit(0)
    }
  }
}

const mergeTarget = (targets) => {
  return targets.sort((t1, t2) => {
    if (t1.priority === 'override') {
      return 1
    }
    if (t2.priority === 'override') {
      return -1
    }
    return t1.priority - t2.priority
  })
    .map(t => t.value)
    .reduce(mergeAnything)
}

/**
 * 
 * @param {{ disableDepCheck }} userConfig 
 * @param {*} webpackConfig2 
 */
const generageConfig = (userConfig, webpackConfig2) => {
  let webpackConfig
  const userConfig2 = _.pickBy(userConfig, Boolean)
  const features = _.map(userConfig2, (v, k) => {
    const Factory = Features[_.capitalize(k)]
    if (Factory) {
      return new Factory(userConfig)
    }
  })
    .filter(Boolean)

  if (features.length === 0) {
    return {}
  }

  // if not passed, process will be terminated
  validateUserConfig(features, userConfig)

  const featuresGrouped = _.groupBy(features, f => f.group)
  const ruleFeatures = featuresGrouped.rule
  const commonFeatures = featuresGrouped.common

  const processFeatures = features => {
    return _.flow(
      _.curryRight(_.map)(f => f.evaled),
      _.flatten,
      _.curryRight(_.groupBy)(t => t.target),
      _.curryRight(_.mapValues)(mergeTarget)
    )(features)
  }

  // const mergeTargetValue = (config, f) => {
  //   const { target, value, priority } = f.eval()
  //   let content = [{
  //     value,
  //     priority
  //   }]
  //   if (config[target]) {
  //     content = [...config[target].content, ...content]
  //   }

  //   return _.assign({}, config, {
  //     [target]: content
  //   })
  // }

  // const ruleConfigs = ruleFeatures.reduce(mergeTargetValue, {})
  const ruleConfigs = processFeatures(ruleFeatures)
  const { file: fileRuleConfig } = ruleConfigs
  // const rulesNoFile = _.map(_.omit(ruleConfigs, ['file']), (config, k) => {
  //   return ruleUtils[k](config)
  // })
  const rulesNoFile = _.flow(
    _.curryRight(_.omitBy)((c, k) => k === 'file'),
    _.curryRight(_.map)((config, k) => ruleUtils[k](config)),
    _.flatten
  )(ruleConfigs)

  console.log(rulesNoFile)

  const webpackRules = fileRuleConfig
    ? [{
      oneOf: [
        ...rulesNoFile,
        ruleUtils.file(fileRuleConfig)
      ]
    }]
    : rulesNoFile

  if (commonFeatures) {
    // webpackConfig = _.mapValues(commonFeatures.reduce(mergeTargetValue, {}), mergeWebpackConfig)
    webpackConfig = processFeatures(commonFeatures)
  }
  webpackConfig = _.assign({}, webpackConfig, {
    module: {
      rules: webpackRules
    }
  })

  const merged = webpackMerge({}, webpackConfig, webpackConfig2)

  // todo: polyfill check

  return merged
}

module.exports = generageConfig
