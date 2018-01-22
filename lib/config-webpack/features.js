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
const ruleUtils = require('./rules')

class Feature {
  static setTarget(target, value, priority = 5) {
    return { target, value, priority }
  }

  constructor({ userConfig, features, defaultConfig, dependency }) {
    this.userConfig = userConfig
    this.features = features
    this.defaultConfig = defaultConfig
    this.config = typeof this.userConfig === 'object' && !_.isEmpty(this.userConfig)
      ? _.merge({}, this.defaultConfig, this.userConfig)
      : this.defaultConfig
    this.dependency = dependency
  }

  validateUserConfigKeys(name) {
    const errs = []
    Object.keys(this.userConfig || {}).forEach(key => {
      if (!Object.keys(this.defaultConfig).includes(key)) {
        errs.push(`${name}: Invalid config key '${key}'`)
      }
    })
    return errs.length === 0 ? null : errs
  }

  validate({ name }) {
    return this.validateUserConfigKeys(name)
  }

  eval() {
  }
}

exports.Feature = Feature

exports.Babel = class Babel extends Feature {
  constructor(arg) {
    super(Object.assign({}, arg, {
      defaultConfig: {
        merge: true,
        babelrc: {
          presets: [
            'react-app'
          ],
          plugins: [
            'lodash',
            'babel-plugin-syntax-dynamic-import'
          ]
        }
      },
      dependency: babelDep
    }))
  }

  eval() {
    const ruleConfig = this.config === this.defaultConfig
      ? this.defaultConfig
      : (
        this.config.merge
          ? mergeAnything(this.defaultConfig, this.userConfig)
          : this.userConfig
      )
    return Feature.setTarget('module.rules[]', ruleUtils.babel(ruleConfig))
  }
}

exports.TypeScript = class Typescript extends Feature {
  constructor(arg) {
    super(Object.assign({}, arg, {
      defaultConfig: {
        merge: true,
        babelrc: {
          plugins: [
            'lodash',
            'babel-plugin-syntax-dynamic-import'
          ]
        }
      },
      dependency: [...babelDep, 'ts-loader', 'typescript']
    }))
  }

  eval() {
    const ruleConfig = this.config === this.defaultConfig
      ? this.defaultConfig
      : (
        this.config.merge
          ? mergeAnything(this.defaultConfig, this.userConfig)
          : this.userConfig
      )
    return Feature.setTarget('module.rules[]', ruleUtils.typescript(ruleConfig))
  }
}

exports.Css = class Css extends Feature {
  constructor(arg) {
    super(Object.assign({}, arg, {
      defaultConfig: {
        sourceMap: true,
        scoped: false,
        isomorphic: false,
      },
      dependency: cssDep,
    }))
  }

  eval() {
    const ruleConfig = _.assign({}, this.config, {
      extract: this.features.ExtractCss
    })
    return Feature.setTarget('module.rules[]', ruleUtils.css(ruleConfig))
  }
}

exports.Sass = class Sass extends Feature {
  constructor(arg) {
    super(Object.assign({}, arg, {
      defaultConfig: {
        sourceMap: true,
        extract: false,
        scoped: false,
        isomorphic: false,
        postcss: 'sass'
      },
      dependency: [...cssDep, 'sass-loader', 'node-sass']
    }))
  }

  eval() {
    const ruleConfig = _.assign({}, this.config, {
      extract: this.features.ExtractCss
    })
    return Feature.setTarget('module.rules[]', ruleUtils.sass(ruleConfig))
  }
}

exports.Graphql = class Graphql extends Feature {
  constructor(arg) {
    super(Object.assign({}, arg, {
      defaultConfig: {},
      dependency: ['graphql-tag']
    }))
  }

  eval() {
    return Feature.setTarget('module.rules[]', ruleUtils.graphql(this.config))
  }
}

exports.Media = class Media extends Feature {
  constructor(arg) {
    super(Object.assign({}, arg, {
      defaultConfig: {
        dataUrl: true,
        // TODO
        testImage: null,
      },
      dependency: ['url-loader', 'file-loader']
    }))
  }

  eval() {
    const { dataUrl } = this.config
    return [
      ...(dataUrl ? [Feature.setTarget('module.rules[]', ruleUtils.image())] : []),
      Feature.setTarget('module.rules[]', ruleUtils.file())
    ]
  }
}

exports.ExcludeExternals = class ExcludeExternals extends Feature {
  constructor(arg) {
    super(Object.assign({}, arg, {
      defaultConfig: {
        whitelist: []
      }
    }))
  }

  eval() {
    return Feature.setTarget('externals', [nodeExternals(this.config)])
  }
}

exports.Define = class Define extends Feature {
  constructor(arg) {
    super(Object.assign({}, arg, {
      defaultConfig: {
        'process.env.NODE_ENV': JSON.stringify(userConfig.production ? 'production' : 'development')
      }
    }))
  }

  eval() {
    const def = stringifyEnv(this.config)
    return Feature.setTarget('plugins[]', new webpack.DefinePlugin(def))
  }
}

exports.Compress = class Compress extends Feature {
  constructor(arg) {
    super(Object.assign({}, arg, {
      defaultConfig: {}
    }))
  }

  eval() {
    return [
      Feature.setTarget('plugins[]', new webpack.optimize.UglifyJsPlugin({
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
      })),
      Feature.setTarget('plugins[]', new OptimizeCssAssetsPlugin({
        assetNameRegExp: /\.css$/g,
        cssProcessor: require('cssnano'), // eslint-disable-line
        cssProcessorOptions: {
          discardComments: { removeAll: true },
          zindex: false
        },
        canPrint: true
      }))
    ]
  }
}

exports.ExtractCss = class ExtractCss extends Feature {
  constructor(arg) {
    super(Object.assign({}, arg, {
      defaultConfig: {}
    }))
  }

  eval() {
    return Feature.setTarget('plugins[]', new ExtractTextPlugin({
      filename: '[name].css',
      disable: false,
      allChunks: true
    }))
  }
}

exports.Md5Hash = class Md5Hash extends Feature {
  constructor(arg) {
    super(Object.assign({}, arg, {
      defaultConfig: {}
    }))
  }

  eval() {
    return Feature.setTarget('plugins[]', new WebpackMd5Hash())
  }
}

exports.Node = class Node extends Feature {
  constructor(arg) {
    super(Object.assign({}, arg, {
      defaultConfig: {}
    }))
  }

  eval() {
    return [
      Feature.setTarget('target', 'node'),
      Feature.setTarget('node', {
        console: false,
        global: false,
        process: false,
        Buffer: false,
        __filename: false,
        __dirname: false,
        setImmediate: false
      })
    ]
  }
}
