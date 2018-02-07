const _ = require('lodash')
const webpack = require('webpack')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const WebpackMd5Hash = require('webpack-md5-hash')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const { cssDep, babelDep, postcssDep, filenames, ruleExclude, scopedClassName } = require('./constants')
const stringifyEnv = require('./stringify-env')
const { mergeAnything, resolveProject } = require('../utils')
const { generateStyleRule } = require('./helpers')

class Feature {
  static setTarget(target, value, priority = 5) {
    return { target, value, priority }
  }

  constructor({ userConfig, features, defaultConfig, dependency, context }) {
    this.userConfig = userConfig
    this.features = features
    this.context = context
    this.defaultConfig = defaultConfig
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
        errs.push(`In ${name}, invalid config key '${key}'`)
      }
    })
    return errs.length === 0 ? null : errs
  }

  validate({ name }) {
    return this.validateUserConfigKeys(name)
  }

  eval() { }
}

exports.Feature = Feature

/**
 * module rules
 */
class Babel extends Feature {
  constructor(arg) {
    super(Object.assign({}, arg, {
      defaultConfig: Babel.defaultConfig,
      dependency: babelDep.concat(arg.features.sass.scoped || arg.features.css.scoped
        ? ['babel-plugin-react-css-modules', ...arg.features.sass.scoped
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
      : mergeAnything(mergeAnything(this.defaultConfig.options, {
        plugins: [
          /**
           * https://github.com/gajus/babel-plugin-react-css-modules#configurate-syntax-loaders
           */
          ...this.features.sass.scoped || this.features.css.scoped
            ? [['react-css-modules', {
              filetypes: this.features.sass.scoped && {
                '.scss': {
                  syntax: 'postcss-scss',
                  plugins: ['postcss-nested']
                }
              },
              generateScopedName: this.context.scopedClassName || scopedClassName
            }]]
            : []
        ]
      }), userConfig.options)

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
Babel.defaultConfig = {
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
}
Babel.desc = 'Add babel support'

class TypeScript extends Feature {
  constructor(arg) {
    super(Object.assign({}, arg, {
      defaultConfig: TypeScript.defaultConfig,
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
TypeScript.defaultConfig = {
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
}

class Css extends Feature {
  constructor(arg) {
    super(Object.assign({}, arg, {
      defaultConfig: Css.defaultConfig,
      dependency: config => [...cssDep, ...config.postcss ? postcssDep : []],
    }))
  }

  eval() {
    const ruleConfig = _.assign({}, this.config, {
      __type: 'Css',
      extract: Boolean(this.features.extractCss),
      isomorphic: false,
      preprocessor: this.config.postcss ? 'postcss' : null,
      scopedClassName: this.config.scopedClassName || this.context.scopedClassName || scopedClassName
    })
    return Feature.setTarget('module.rules[]', generateStyleRule(ruleConfig))
  }
}
Css.defaultConfig = {
  scoped: false,
  test: /\.css$/,
  scopedClassName: null,
  postcss: false
}

class Sass extends Feature {
  constructor(arg) {
    super(Object.assign({}, arg, {
      defaultConfig: Sass.defaultConfig,
      dependency: [...cssDep, 'sass-loader', 'node-sass']
    }))
  }

  eval() {
    const ruleConfig = _.assign({}, this.config, {
      __type: 'Sass',
      extract: Boolean(this.features.extractCss),
      isomorphic: false,
      preprocessor: 'sass',
      scopedClassName: this.config.scopedClassName || this.context.scopedClassName || scopedClassName
    })
    return Feature.setTarget('module.rules[]', generateStyleRule(ruleConfig))
  }
}
Sass.defaultConfig = {
  scoped: false,
  test: /\.scss$/,
  scopedClassName: null
}

class GraphQL extends Feature {
  constructor(arg) {
    super(Object.assign({}, arg, {
      defaultConfig: GraphQL.defaultConfig,
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
GraphQL.defaultConfig = {
  test: /\.(graphql|gql)$/
}

class ESLint extends Feature {
  constructor(arg) {
    super(Object.assign({}, arg, {
      defaultConfig: ESLint.defaultConfig,
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
ESLint.defaultConfig = {
  test: /\.jsx?$/
}

class Media extends Feature {
  constructor(arg) {
    super(Object.assign({}, arg, {
      defaultConfig: Media.defaultConfig,
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
Media.defaultConfig = {
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
}

/**
 * plugins
 */
class SplitVendor extends Feature {
  constructor(arg) {
    super(Object.assign({}, arg, {
      defaultConfig: SplitVendor.defaultConfig
    }))
  }

  eval() {
    return [
      Feature.setTarget('plugins[]', new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks(module) {
          // any required modules inside node_modules are extracted to vendor
          return (
            module.resource && (/\.js$/).test(module.resource) &&
            module.resource.indexOf(resolveProject('node_modules')) === 0
          )
        }
      })),
      Feature.setTarget('plugins[]', new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest',
        chunks: ['vendor']
      }))
    ]
  }
}
SplitVendor.defaultConfig = {}

class Define extends Feature {
  constructor(arg) {
    super(Object.assign({}, arg, {
      defaultConfig: Define.defaultConfig
    }))
  }

  validate({ name }) {
    const errs = []
    if (typeof (this.userConfig || {}) !== 'object') {
      errs.push(`In ${name}, config should be an object`)
    }
    return errs.length === 0 ? null : errs
  }

  eval() {
    const config = Object.assign({}, this.config, {
      'process.env.NODE_ENV': JSON.stringify(this.context.production ? 'production' : 'development')
    })
    const def = stringifyEnv(config)
    return Feature.setTarget('plugins[]', new webpack.DefinePlugin(def))
  }
}
Define.defaultConfig = {
  'process.env.NODE_ENV': 'development'
}

class Compress extends Feature {
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

class ExtractCss extends Feature {
  constructor(arg) {
    super(Object.assign({}, arg, {
      defaultConfig: ExtractCss.defaultConfig
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
ExtractCss.defaultConfig = {
  filename: filenames.css
}

class Md5Hash extends Feature {
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
class ExcludeExternals extends Feature {
  constructor(arg) {
    super(Object.assign({}, arg, {
      defaultConfig: ExcludeExternals.defaultConfig
    }))
  }

  eval() {
    return Feature.setTarget('externals', [nodeExternals(this.config)])
  }
}
ExcludeExternals.defaultConfig = {
  whitelist: []
}

class Node extends Feature {
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

exports.TypeScript = TypeScript
exports.Babel = Babel
exports.Css = Css
exports.Sass = Sass
exports.GraphQL = GraphQL
exports.ESLint = ESLint
exports.Media = Media
exports.SplitVendor = SplitVendor
exports.Define = Define
exports.Compress = Compress
exports.ExtractCss = ExtractCss
exports.Md5Hash = Md5Hash
exports.ExcludeExternals = ExcludeExternals
exports.Node = Node
