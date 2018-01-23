const _ = require('lodash')
const webpack = require('webpack')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const WebpackMd5Hash = require('webpack-md5-hash')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const webpackRules = require('./rules')
const { cssDep, babelDep, filenames, ruleExclude } = require('./constants')
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

/**
 * module rules
 */
exports.Babel = class Babel extends Feature {
  constructor(arg) {
    super(Object.assign({}, arg, {
      defaultConfig: {
        test: /\.(js|jsx|mjs)$/,
        options: {
          presets: [
            'react-app'
          ],
          plugins: [
            'lodash',
            'syntax-dynamic-import'
          ],
          /**
           * webpack can detect babelrc file change, and many other packages
           * may depend on babelrc file, so I will let babelrc to be true by default
           */
          babelrc: true,
        }
      },
      dependency: babelDep
    }))
  }

  eval() {
    const userConfig = this.userConfig || {}
    const options = typeof this.config.options === 'function'
      ? this.config.options(this.defaultConfig.options)
      : mergeAnything(this.defaultConfig.options, userConfig.options)

    return Feature.setTarget('module.rules[]', {
      __type: 'Babel',
      loader: 'babel-loader',
      test: this.config.test,
      exclude: ruleExclude,
      // babel will read options here and merge it with .babelrc file
      options
    })
  }
}

exports.TypeScript = class Typescript extends Feature {
  constructor(arg) {
    super(Object.assign({}, arg, {
      defaultConfig: {
        test: /\.tsx?$/,
        babelOptions: {
          plugins: [
            'lodash',
            'syntax-dynamic-import'
          ],
          /**
           * typescript should rely less on babel
           */
          babelrc: false,
        }
      },
      dependency: [...babelDep, 'ts-loader', 'typescript']
    }))
  }

  eval() {
    const userConfig = this.userConfig || {}
    const babelOptions = typeof this.config.babelOptions === 'function'
      ? this.config.babelOptions(this.defaultConfig.babelOptions)
      : mergeAnything(this.defaultConfig.babelOptions, userConfig.babelOptions)

    return Feature.setTarget('module.rules[]', {
      __type: 'TypeScript',
      test: this.config.test,
      exclude: ruleExclude,
      use: [
        {
          loader: 'babel-loader',
          options: babelOptions
        },
        {
          loader: 'ts-loader'
        }
      ]
    })
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
      extract: Boolean(this.features.ExtractCss)
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

exports.GraphQL = class GraphQL extends Feature {
  constructor(arg) {
    super(Object.assign({}, arg, {
      defaultConfig: {
        test: /\.(graphql|gql)$/
      },
      dependency: ['graphql-tag']
    }))
  }

  eval() {
    return Feature.setTarget('module.rules[]', {
      __type: 'GraphQL',
      loader: 'graphql-tag/loader',
      test: this.config.test,
      exclude: ruleExclude,
    })
  }
}

exports.ESLint = class ESLint extends Feature {
  constructor(arg) {
    super(Object.assign({}, arg, {
      defaultConfig: {
        test: /\.jsx?$/
      },
      dependency: ['eslint-loader', 'eslint']
    }))
  }

  eval() {
    return Feature.setTarget('module.rules[]', {
      __type: 'EsLint',
      loader: 'eslint-loader',
      enforce: 'pre',
      test: this.config.test,
      exclude: ruleExclude,
    })
  }
}

exports.Media = class Media extends Feature {
  constructor(arg) {
    super(Object.assign({}, arg, {
      defaultConfig: {
        // if dataUrl is false, these will be ignored
        dataUrl: true,
        imageTest: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        imageOptions: {
          limit: 10000,
          name: filenames.img
        },

        fileOptions: {
          name: filenames.file
        }
      },
      dependency: ['url-loader', 'file-loader']
    }))
  }

  eval() {
    const { dataUrl } = this.config
    return [
      ...(
        dataUrl
          ? [Feature.setTarget('module.rules[]', {
            __type: 'Image',
            loader: 'url-loader',
            test: this.config.imageTest,
            options: this.config.imageOptions,
          })]
          : []
      ),
      Feature.setTarget('module.rules[]', {
        __type: 'File',
        loader: 'file-loader',
        exclude: [/\.js$/, /\.html$/, /\.json$/],
        options: this.config.fileOptions,
      })
    ]
  }
}

/**
 * plugins
 */
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
      defaultConfig: {
        filename: filenames.css
      }
    }))
  }

  eval() {
    return Feature.setTarget('plugins[]', new ExtractTextPlugin({
      filename: this.config.filename,
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

/**
 * other config
 */
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
