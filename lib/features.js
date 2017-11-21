const _ = require('lodash')
const webpack = require('webpack')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const WebpackMd5Hash = require('webpack-md5-hash')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const webpackRules = require('./rules')
const { cssDep } = require('./constants')

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
    return _.merge({}, this.defaultConfig, this.userConfig[this.key])
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

exports.Media = class Media extends RuleFeature {
  constructor(userConfig) {
    super(userConfig, {
      key: 'media',
      defaultConfig: {
        loadImgWithUrlLoader: true
      }
    })
  }

  get dependency() {
    return ['url-loader', 'file-loader']
  }

  eval() {
    const { loadImgWithUrlLoader } = this.config
    return [
      ...loadImgWithUrlLoader ? Feature.setTarget('image', undefined, 1) : [],
      Feature.setTarget('file', undefined, 1)
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
    return [...cssDep, this.config.postcss ? ['postcss', 'postcss-cssnext', 'postcss-import', 'postcss-loader'] : []]
  }

  eval() {
    const isProduction = this.userConfig.production
    const config = _.assign({}, this.config, {
      sourceMap: !isProduction,
      extract: isProduction
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
      sourceMap: !isProduction,
      extract: isProduction
    })
    return Feature.setTarget('sass', config, 1)
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
    return Feature.setTarget('plugins', value, 1)
  }
}
