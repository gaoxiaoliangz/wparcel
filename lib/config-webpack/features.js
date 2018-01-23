const _ = require('lodash')
const webpack = require('webpack')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const WebpackMd5Hash = require('webpack-md5-hash')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const { cssDep, babelDep, postcssDep, filenames, ruleExclude, scopedClassName } = require('./constants')
const stringifyEnv = require('./stringify-env')
const { mergeAnything } = require('../utils')
const { generateStyleRule } = require('./helpers')

class Feature {
  static setTarget(target, value, priority = 5) {
    return { target, value, priority }
  }

  constructor({ userConfig, features, defaultConfig, dependency }) {
    this.userConfig = userConfig
    this.features = features
    this.defaultConfig = typeof defaultConfig === 'function'
      ? defaultConfig()
      : defaultConfig
    this.config = typeof this.userConfig === 'object' && !_.isEmpty(this.userConfig)
      ? _.merge({}, this.defaultConfig, this.userConfig)
      : this.defaultConfig
    this.dependency = typeof dependency === 'function'
      ? dependency(this.config)
      : dependency
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
            'syntax-dynamic-import',
            /**
             * https://github.com/gajus/babel-plugin-react-css-modules#configurate-syntax-loaders
             */
            ...arg.features.Sass.scoped || arg.features.Css.scoped
              ? [['react-css-modules', {
                filetypes: arg.features.Sass.scoped && {
                  '.scss': {
                    syntax: 'postcss-scss',
                    plugins: ['postcss-nested']
                  }
                },
                generateScopedName: scopedClassName
              }]]
              : []
          ],
          /**
           * webpack can detect babelrc file change, and many other packages
           * may depend on babelrc file, so I will let babelrc to be true by default
           */
          babelrc: true,
        }
      },
      dependency: babelDep.concat(arg.features.Sass.scoped || arg.features.Css.scoped
        ? ['babel-plugin-react-css-modules', ...arg.features.Sass.scoped
          ? ['postcss-scss', 'postcss-nested']
          : []
        ]
        : []
      )
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
        scoped: false,
        test: /\.css$/,
        scopedClassName,
        postcss: false
      },
      dependency: config => [...cssDep, ...config.postcss ? postcssDep : []],
    }))
  }

  eval() {
    const ruleConfig = _.assign({}, this.config, {
      __type: 'Css',
      extract: Boolean(this.features.ExtractCss),
      isomorphic: false,
      preprocessor: this.config.postcss ? 'postcss' : null
    })
    return Feature.setTarget('module.rules[]', generateStyleRule(ruleConfig))
  }
}

exports.Sass = class Sass extends Feature {
  constructor(arg) {
    super(Object.assign({}, arg, {
      defaultConfig: {
        scoped: false,
        test: /\.scss$/,
        scopedClassName
      },
      dependency: [...cssDep, 'sass-loader', 'node-sass']
    }))
  }

  eval() {
    const ruleConfig = _.assign({}, this.config, {
      __type: 'Sass',
      extract: Boolean(this.features.ExtractCss),
      isomorphic: false,
      preprocessor: 'sass'
    })
    return Feature.setTarget('module.rules[]', generateStyleRule(ruleConfig))
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
