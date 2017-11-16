const _ = require('lodash')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const makeStyleRule = ({
  sourceMap = true,
  extract = false,
  scoped = false,
  isomorphic = false,
  processor = null, // 'postcss' | 'sass'
  test = null
}) => {
  const styleLoader = isomorphic ? 'isomorphic-style-loader' : 'style-loader'
  const localIdentName = !scoped ? '[local]' : '[local]_[hash:base64:5]'
  const loaders = [
    {
      loader: 'css-loader',
      query: {
        sourceMap,
        modules: true,
        importLoaders: 1,
        localIdentName
      }
    },
  ]

  if (processor === 'postcss') {
    loaders.push({
      loader: 'postcss-loader',
      options: {
        plugins: () => [
          require('postcss-import')(), // eslint-disable-line
          require('postcss-cssnext') // eslint-disable-line
        ]
      }
    })
  } else if (processor === 'sass') {
    loaders.push({
      loader: 'sass-loader'
    })
  }

  return {
    test,
    use: extract
      ? ExtractTextPlugin.extract({
        fallback: styleLoader,
        use: loaders,
        // todo
        publicPath: '/static/'
      })
      : [styleLoader].concat(loaders)
  }
}

const rules = {
  esLint() {
    return {
      enforce: 'pre',
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'eslint-loader',
    }
  },

  graphql() {
    return {
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      loader: 'graphql-tag/loader',
    }
  },

  babel({ babelrc }) {
    const defaultBabelrc = {
      presets: [
        'es2015'
      ]
    }

    return {
      test: /\.(js|jsx|mjs)$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'babel-loader',
      options: _.merge({}, {
        babelrc: false,
      }, defaultBabelrc, babelrc)
    }
  },

  typescript({ babelConfig } = {}) {
    // todo
    const _babelConfig = true
      ? {
        presets: [
          ['es2015', {
            modules: false
          }]
        ]
      }
      : {
        presets: [
          ['es2015', {
            modules: false
          }]
        ],
        plugins: [
          'lodash'
        ]
      }

    return {
      test: /\.tsx?$/,
      use: [
        {
          loader: 'babel-loader',
          options: Object.assign({}, {
            babelrc: false,
            // ...(babelConfig || _babelConfig)
          }, _babelConfig)
        },
        {
          loader: 'ts-loader'
        }
      ]
    }
  },

  sass({ isomorphic, extract, sourceMap, scoped, globalFileExt = 'global' }) {
    if (scoped) {
      const testLocal = new RegExp(`^((?!${globalFileExt}).)*\.scss$`)
      const testGlobal = new RegExp(`\.${globalFileExt}.scss$`)
      const processor = 'sass'
      return [
        makeStyleRule({ isomorphic, extract, sourceMap, processor, scoped: true, test: testLocal }),
        makeStyleRule({ isomorphic, extract, sourceMap, processor, scoped: false, test: testGlobal }),
      ]
    }
    return makeStyleRule({ isomorphic, extract, sourceMap, processor, scoped: false, test: /\.scss$/ })
  },

  css(config) {
    return makeStyleRule(Object.assign({}, config, {
      test: /\.css$/,
    }))
  },

  image() {
    return {
      test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: 'static/media/[name].[hash:8].[ext]',
      },
    }
  },

  file() {
    return {
      exclude: [/\.js$/, /\.html$/, /\.json$/],
      loader: 'file-loader',
      options: {
        name: 'static/media/[name].[hash:8].[ext]',
      },
    }
  }
}

module.exports = rules
