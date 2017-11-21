const _ = require('lodash')
const colors = require('colors/safe')
const webpackMerge = require('webpack-merge')
const Features = require('./features')

const getDeps = features => {
  const deps = _.reduce(features, (deps, f) => {
    return [...deps, ...f.dependency]
  }, [])
  return _.union(deps)
}

const validateUserConfig = (features) => {
  const deps = getDeps(features)

  const missingDeps = [...deps, ...featuresConfig.essDep].filter(dep => {
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

const mergeWebpackConfig = (configs) => {
  return configs.sort((config1, config2) => {
    if (config1.priority === 'override') {
      return 1
    }
    if (config2.priority === 'override') {
      return -1
    }
    return config1.priority - config2.priority
  })
    .map(config => config.value)
    .reduce(mergeAnything)
}

const generageConfig = (userConfig, webpackConfig2) => {
  let webpackConfig
  const userConfig2 = _.pickBy(userConfig, Boolean)
  const features = _.map(userFeatures, (v, k) => {
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
  validateUserConfig(features)

  const featuresGrouped = _.groupBy(features, f => f.group)
  const ruleFeatures = featuresGrouped.rule
  const commonFeatures = featuresGrouped.common

  const mergeTargetValue = (config, f) => {
    const { target, value, priority } = f.eval()
    let content = [{
      value,
      priority
    }]
    if (config[target]) {
      content = [...config[target].content, ...content]
    }

    return _.assign({}, config, {
      [evaled.target]: content
    })
  }

  const commonConfigs = commonFeatures.reduce(mergeTargetValue, {})
  const ruleConfigs = ruleFeatures.reduce(mergeTargetValue, {})

  const { file: fileRuleConfig } = ruleConfigs
  const rulesNoFile = _.map(_.omit(ruleConfigs, ['file']), (config, k) => ruleUtils[k](config))
  const webpackRules = fileRuleConfig
    ? [{
      oneOf: [
        ...rulesNoFile,
        ruleUtils.file(fileRuleConfig)
      ]
    }]
    : rulesNoFile
  webpackConfig = _.mapValues(commonConfigs, mergeWebpackConfig)
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
