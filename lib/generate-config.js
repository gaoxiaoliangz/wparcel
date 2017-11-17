const webpack = require('webpack')
const _ = require('lodash')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const WebpackMd5Hash = require('webpack-md5-hash')
const webpackMerge = require('webpack-merge')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const webpackRules = require('./rules')
const { isDepInstalled, resolveApp } = require('./utils')
const featuresConfig = require('./features.config')
const baseConfig = require('./base.config')
const exampleTsconfig = require('./example-tsconfig')
const nodeExternals = require('webpack-node-externals')
const colors = require('colors/safe')

const featuresFn = featuresConfig.features

const printErrorAndExit = (msg, exit = true) => {
  console.error(colors.red(`ERROR: ${msg}`))
  if (exit) {
    process.exit(0)
  }
}

const printWarning = msg => {
  console.warn(colors.yellow(`WARNING: ${msg}`))
}

const getFeatureDefinitions = features => featuresFn({ isProduction: features.production })

const getDeps = features => {
  const featureDefinitions = getFeatureDefinitions(features)
  const defaultFeatures = _.mapValues(featureDefinitions, f => Boolean(f.enableByDefault))
  const userFeatures = _.mapValues(features, Boolean)
  const enabled = _.pick(featureDefinitions, Object.keys(_.pickBy(Object.assign({}, defaultFeatures, userFeatures), Boolean)))
  const deps = _.filter(enabled, f => f.dep).map(feature => feature.dep)
  const deps2 = _.flatten(deps)
  return _.union(deps2)
}

/**
 * @param {(string | {})[]} features
 * @return {{[rule: string]: { priority?: number, feature: { name: string, config: {} } }[]}[]}
 */
const getRuleConfig = features => {
  const featureDefinitions = getFeatureDefinitions(features)
  const featureNames = _.map(features, (v, k) => v ? k : undefined).filter(Boolean)
  const featureWithRule = _.map(featureNames, name => {
    const rule = _.get(featureDefinitions, [name, 'rule'])
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
        priority: featureDefinitions[featureName].priority,
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
  const featureDefinitions = getFeatureDefinitions(features)
  const rules = getRuleConfig(features)
  return _.reduce(rules, (allRules, ruleConfigs, ruleName) => {
    const ruleConfig = ruleConfigs.sort((r1, r2) => {
      return r1.priority - r2.priority
    })
      .map(rule => {
        const defaultRuleConfig = featureDefinitions[rule.feature.name].defaultRuleConfig || {}
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
 * @param {{features: { polyfill, react, sass, node, css, postcss, babel, typescript, excludeExternals }}} config 
 */
function generateConfig(config, webpackConfig) {
  const { features } = config
  const featureDefinitions = getFeatureDefinitions(features)
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

  // rules
  const cssAndJsRules = createRules(features)
  let rules
  if (features.media === false) {
    rules = cssAndJsRules
  } else {
    const { loadImgWithUrlLoader } = Object.assign({}, featureDefinitions.media, features.media)
    rules = [
      {
        oneOf: [
          ...loadImgWithUrlLoader ? [webpackRules.image()] : [],
          ...cssAndJsRules,
          webpackRules.file()
        ]
      }
    ]
  }

  // plugins
  const plugins = []
  if (features.production) {
    plugins.push(new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }))
    plugins.push(new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        screw_ie8: true, // React doesn't support IE8
        warnings: false,
        unused: true,
        dead_code: true,
      },
      mangle: {
        screw_ie8: true,
      },
      output: {
        comments: false,
        screw_ie8: true,
      },
    }))
    plugins.push(new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano'), // eslint-disable-line
      cssProcessorOptions: {
        discardComments: { removeAll: true },
        zindex: false
      },
      canPrint: true
    }))
    plugins.push(new WebpackMd5Hash())
    plugins.push(new ExtractTextPlugin({
      filename: '[name].css',
      disable: false,
      allChunks: true
    }))
  }

  const merged = webpackMerge({}, baseConfig, {
    module: {
      rules,
    },
    plugins
  }, webpackConfig)

  if (!merged.entry) {
    printErrorAndExit('Missing entry')
  }

  if (!merged.output) {
    printErrorAndExit('Missing output!')
  }

  if (features.excludeExternals) {
    const nodeExternalsConfig = features.excludeExternals.config || featureDefinitions.excludeExternals.config
    merged.externals = [nodeExternals(nodeExternalsConfig)]
  }

  if (features.node) {
    merged.target = 'node'
    merged.node = {
      console: false,
      global: false,
      process: false,
      Buffer: false,
      __filename: false,
      __dirname: false,
      setImmediate: false
    }
  }

  if (features.polyfill) {
    const hasPolyfill = _.find(merged.entry, paths => {
      if (typeof paths === 'string') {
        return paths.includes('babel-polyfill')
      }
      return paths.some(p => {
        return p.includes('babel-polyfill')
      })
    })
    if (!hasPolyfill) {
      printWarning('`babel-polyfill` should be placed in one of you entry config in order to work!')
    }
  }
  return merged
}

module.exports = generateConfig
