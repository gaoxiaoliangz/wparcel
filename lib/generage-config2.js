const _ = require('lodash')
const colors = require('colors/safe')
const webpackMerge = require('webpack-merge')
const featureMapping = require('./feature-mapping')

const printErrorAndExit = (msg, exit = true) => {
  console.error(colors.red(`ERROR: ${msg}`))
  if (exit) {
    process.exit(0)
  }
}

const printWarning = msg => {
  console.warn(colors.yellow(`WARNING: ${msg}`))
}

const getDeps = features => {
  const featureDefinitions = getFeatureDefinitions(features)
  const defaultFeatures = _.mapValues(featureDefinitions, f => Boolean(f.enableByDefault))
  const userFeatures = _.mapValues(features, Boolean)
  const enabled = _.pick(featureDefinitions, Object.keys(_.pickBy(Object.assign({}, defaultFeatures, userFeatures), Boolean)))
  const deps = _.filter(enabled, f => f.dep).map(feature => feature.dep)
  const deps2 = _.flatten(deps)
  return _.union(deps2)
}

// merge objects with array without mutation
const mergeWithArrConcat = (object, sources) => {
  const isArg1Array = Array.isArray(object)
  const isArg2Array = Array.isArray(sources)

  if (isArg1Array && isArg2Array) {
    return [...object, ...sources]
  }

  if ((isArg1Array || isArg2Array) && (!isArg1Array || !isArg2Array)) {
    printErrorAndExit('Cannot merge array with anything other than array')
  }

  const customizer = (objValue, srcValue) => {
    if (_.isArray(objValue)) {
      return objValue.concat(srcValue)
    }
  }
  const object2 = _.cloneDeep(object)
  return _.mergeWith(object2, sources, customizer)
}

const validateUserConfig = ({ features }) => {
  const deps = getDeps(features)

  const missingDeps = [...deps, ...featuresConfig.essDep].filter(dep => {
    return !isDepInstalled(dep)
  })

  const hint = `Some packages are not installed, install these packages by running\n\nyarn add ${missingDeps.join(' ')} --dev\n`

  if (missingDeps.length !== 0) {
    printErrorAndExit(hint)
  }

  if (features.typescript) {
    try {
      require.resolve(resolveApp('tsconfig.json'))
    } catch (error) {
      printErrorAndExit('When enabling typescript tsconfig.json is requierd! You can use the following config as a template', false)
      console.log(exampleTsconfig)
      process.exit(0)
    }
  }
}

const generageConfig = (userConfig, webpackConfig2) => {
  const webpackConfig = {}
  const { features: userFeatures } = userConfig

  // if not passed, process will be terminated
  validateUserConfig(userConfig)

  // feaures that enabled by user
  const userFeatures2 = _.pickBy(userFeatures, Boolean)
  const enabledFeatureKeys = _.keys(userFeatures2)
  const pickedFeatureMapping = _.pick(featureMapping, enabledFeatureKeys)

  const userFeatureConfigWithDefault = _.mapValues(userFeatures2, (config, key) => {
    const defaultConfig = pickedFeatureMapping[key].defaultConfig
    return _.merge({}, defaultConfig, config)
  })

  // grouped by feature
  // {[target: string]: {value, priority}}[]
  const configList = _.reduce(userFeatures, (list, userFeatureConfig, key) => {
    const config = definedFeature.mapFn(userFeatureConfigWithDefault[key], userFeatureConfigWithDefault)
    return list.concat(config)
  }, [])

  // merge configs
  // would produce something like 
  // {[target: string]: {value, priority}[]}
  const configGroups = _.reduce(configList, (groups, featureConfigs) => {
    return mergeWithArrConcat(groups, featureConfigs)
  }, [])

  // merged configs of target
  // {[target: string]: config: any}
  const configGroups2 = _.mapValues(configGroups, (configs, target) => {
    const configWithOverride = configs.filter(config => config.priority === 'override')
    if (configWithOverride.lenght > 1) {
      printWarning('Config2 with `override` should not be over 2')
    }

    if (_.last(configs).priority === 'override') {
      return _.last(configs).value
    }

    return configs2 = configs
      .sort((a, b) => a.priority - b.priority)
      .reduce((merged, config) => {
        return mergeWithArrConcat(merged, config.value)
      }, {})
  })

  // convert to webpack config

  // webpack rules
  const ruleConfigGroups = _.pickBy(configGroups, (config, key) => key.indexOf('rules:') === 0)
  const ruleConfigGroups2 = _.mapKeys(ruleConfigGroups, (v, k) => k.replace('rules:', ''))
  // rules evaled
  const ruleConfigGroups3 = _.mapValues(ruleConfigGroups2, (v, k) => webpackRules[k](v))

  let webpackRules = _.map(restRules, _.identity)
  const { file: fileRule, ...restRules } = ruleConfigGroups3
  if (fileRule) {
    webpackRules = [{
      oneOf: [
        ...webpackRules,
        fileRule
      ]
    }]
  }

  webpackConfig.rules = webpackRules

  // webpack config without rules
  const restWebpackConfig = _.omit(configGroups, _.keys(ruleConfigGroups))

  webpackConfig = _.assign({}, webpackConfig, restWebpackConfig)

  const merged = webpackMerge({}, webpackConfig, webpackConfig2)

  // todo: polyfill check

  return merged
}

module.exports = generageConfig
