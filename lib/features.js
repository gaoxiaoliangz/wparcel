const _ = require('lodash')
const webpackRules = require('./rules')
const { cssDep } = require('./constants')

class Feature {
  constructor(userConfig, { key, group, defaultConfig, priority, target }) {
    this.key = key
    this.userConfig = userConfig
    this.group = group
    this.defaultConfig = defaultConfig
    this.priority = priority
    this.target = target
  }

  get config() {
    return _.merge({}, this.defaultConfig, this.userConfig[this.key])
  }
}

class RuleFeature extends Feature {
  constructor(userConfig, obj) {
    super(userConfig, _.assign({}, obj, {
      group: 'rule'
    }))
  }

  eval() {
    return {
      priority: this.priority,
      target: this.rule,
      value: this.ruleConfig
    }
  }
}

class CommonFeature extends Feature {
  constructor(userConfig, obj) {
    super(userConfig, _.assign({}, obj, {
      group: 'common'
    }))
  }

  eval() {
    return {
      priority: this.priority,
      target: this.target,
      value: this.preEval()
    }
  }
}

exports.Css = class Css extends RuleFeature {
  constructor(userConfig) {
    super(userConfig, {
      key: 'css',
      rule: 'css',
      priority: 1,
      defaultConfig: {
        scoped: false,
        sourceMap: true,
      }
    })
  }

  get ruleConfig() {
    const isProduction = this.userConfig.production
    const config = _.assign({}, this.config, {
      sourceMap: !isProduction,
      extract: isProduction
    })
    return config
  }

  get dependency() {
    return [...cssDep, this.config.postcss ? ['postcss', 'postcss-cssnext', 'postcss-import', 'postcss-loader'] : []]
  }
}

exports.Production = class Production extends CommonFeature {
  constructor(userConfig) {
    super(userConfig, {
      key: 'production',
      priority: 1,
      target: 'plugins',
      defaultConfig: {
        compress: true,
      }
    })
  }

  preEval() {
    const config = this.config
    return [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      config.compress ? [new webpack.optimize.UglifyJsPlugin({
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
      })] : [],
      new OptimizeCssAssetsPlugin({
        assetNameRegExp: /\.css$/g,
        cssProcessor: require('cssnano'), // eslint-disable-line
        cssProcessorOptions: {
          discardComments: { removeAll: true },
          zindex: false
        },
        canPrint: true
      }),
      new WebpackMd5Hash(),
      new ExtractTextPlugin({
        filename: '[name].css',
        disable: false,
        allChunks: true
      })
    ]
  }
}
