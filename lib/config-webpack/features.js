const _ = require('lodash')
const webpack = require('webpack')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const WebpackMd5Hash = require('webpack-md5-hash')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const webpackRules = require('./rules')
const { cssDep, babelDep } = require('./constants')
const stringifyEnv = require('./stringify-env')
const { mergeAnything } = require('../utils')

const extractPlugin = () => {
  return new ExtractTextPlugin({
    filename: '[name].css',
    disable: false,
    allChunks: true
  })
}

class Feature {
  static setTarget(target, value, priority) {
    return { target, value, priority }
  }

  constructor(userConfig, { key, group, defaultConfig, priority, target }) {
    this.key = key
    this.userConfig = userConfig
    this.group = group
    this.defaultConfig = defaultConfig
    this.evaled = this.eval()
  }

  get config() {
    const userConfig = this.userConfig[this.key]
    if (typeof userConfig === 'object' && !_.isEmpty(userConfig)) {
      const merged = _.merge({}, this.defaultConfig, userConfig)
      return merged
    }
    return this.defaultConfig
  }
}

class RuleFeature extends Feature {
  constructor(userConfig, obj) {
    super(userConfig, _.assign({}, obj, {
      group: 'rule'
    }))
  }
}

class CommonFeature extends Feature {
  constructor(userConfig, obj) {
    super(userConfig, _.assign({}, obj, {
      group: 'common'
    }))
  }
}

// rule features
exports.Babel = class Babel extends RuleFeature {
  constructor(userConfig) {
    super(userConfig, {
      key: 'babel',
      defaultConfig: {
        merge: true,
        babelrc: {
          presets: [
            'react-app'
          ],
          plugins: [
            'lodash'
          ]
        }
      }
    })
  }

  get dependency() {
    return babelDep
  }

  eval() {
    const config = this.config === this.defaultConfig
      ? this.defaultConfig
      : (
        this.config.merge
          ? mergeAnything(this.defaultConfig, this.userConfig[this.key])
          : this.userConfig[this.key]
      )
    return Feature.setTarget('babel', config, 1)
  }
}

exports.Typescript = class Typescript extends RuleFeature {
  constructor(userConfig) {
    super(userConfig, {
      key: 'typescript',
      defaultConfig: {}
    })
  }

  get dependency() {
    return [...babelDep, 'ts-loader', 'typescript']
  }

  eval() {
    return Feature.setTarget('typescript', this.config, 1)
  }
}

exports.Graphql = class Graphql extends RuleFeature {
  constructor(userConfig) {
    super(userConfig, {
      key: 'graphql',
      defaultConfig: {}
    })
  }

  get dependency() {
    return ['graphql-tag']
  }

  eval() {
    return Feature.setTarget('graphql', this.config, 1)
  }
}

exports.Media = class Media extends RuleFeature {
  constructor(userConfig) {
    super(userConfig, {
      key: 'media',
      defaultConfig: {
        dataUrl: true
      }
    })
  }

  get dependency() {
    return ['url-loader', 'file-loader']
  }

  eval() {
    const { dataUrl } = this.config
    return [
      ...(dataUrl ? [Feature.setTarget('image', {}, 1)] : []),
      Feature.setTarget('file', {}, 1)
    ]
  }
}

exports.Css = class Css extends RuleFeature {
  constructor(userConfig) {
    super(userConfig, {
      key: 'css',
      defaultConfig: {
        sourceMap: true,
        extract: false,
        scoped: false,
        isomorphic: true,
        postcss: false
      }
    })
  }

  get dependency() {
    return [...cssDep, ...this.config.postcss ? ['postcss', 'postcss-cssnext', 'postcss-import', 'postcss-loader'] : []]
  }

  eval() {
    const isProduction = this.userConfig.production
    const config = _.assign({}, this.config, {
      extract: isProduction ? true : this.config.extract
    })
    return Feature.setTarget('css', config, 1)
  }
}

exports.Sass = class Sass extends RuleFeature {
  constructor(userConfig) {
    super(userConfig, {
      key: 'sass',
      defaultConfig: {
        sourceMap: true,
        extract: false,
        scoped: false,
        isomorphic: true,
        postcss: 'sass'
      }
    })
  }

  get dependency() {
    return [...cssDep, 'sass-loader', 'node-sass']
  }

  eval() {
    const isProduction = this.userConfig.production
    const config = _.assign({}, this.config, {
      extract: isProduction ? true : this.config.extract
    })
    return Feature.setTarget('sass', config, 1)
  }
}

// common features
exports.Node = class Node extends CommonFeature {
  constructor(userConfig) {
    super(userConfig, {
      key: 'node',
      defaultConfig: {}
    })
  }

  eval() {
    return [
      Feature.setTarget('target', 'node', 1),
      Feature.setTarget('node', {
        console: false,
        global: false,
        process: false,
        Buffer: false,
        __filename: false,
        __dirname: false,
        setImmediate: false
      }, 1)
    ]
  }
}

exports.Polyfill = class Polyfill extends CommonFeature {
  constructor(userConfig) {
    super(userConfig, {
      key: 'polyfill',
      defaultConfig: {}
    })
  }

  get dependency() {
    return ['babel-polyfill']
  }

  eval() {
    return []
  }
}

exports.ExcludeExternals = class ExcludeExternals extends CommonFeature {
  constructor(userConfig) {
    super(userConfig, {
      key: 'excludeExternals',
      defaultConfig: {
        whitelist: [],
      }
    })
  }

  eval() {
    return Feature.setTarget('externals', [nodeExternals(this.config)], 1)
  }
}

// this feature is enabled by default
// just used this to walk around the css extraction issue
exports.DefaultFeature = class DefaultFeature extends CommonFeature {
  constructor(userConfig) {
    super(userConfig, {
      key: 'defaultFeature'
    })
  }

  eval() {
    const useExtract = _.get(this.userConfig, 'css.extract', false) ||
      _.get(this.userConfig, 'sass.extract', false)
    return useExtract && Feature.setTarget('plugins', [
      extractPlugin()
    ], 1)
  }
}

exports.Define = class Define extends CommonFeature {
  constructor(userConfig) {
    super(userConfig, {
      key: 'define',
      defaultConfig: {
        'process.env.NODE_ENV': JSON.stringify(userConfig.production ? 'production' : 'development')
      }
    })
  }

  eval() {
    const def = stringifyEnv(this.config)
    return Feature.setTarget('plugins', [
      new webpack.DefinePlugin(def),
    ], 1)
  }
}

exports.Production = class Production extends CommonFeature {
  constructor(userConfig) {
    super(userConfig, {
      key: 'production',
      defaultConfig: {
        compress: true,
      }
    })
  }

  eval() {
    const config = this.config
    const value = [
      ...config.compress ? [new webpack.optimize.UglifyJsPlugin({
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
      ...(this.userConfig.css || this.userConfig.sass) ? [extractPlugin()] : []
    ]
    return Feature.setTarget('plugins', value, 1)
  }
}
