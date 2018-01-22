const _ = require('lodash')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const makeStyleRule = ({
  sourceMap = true,
  extract = false,
  scoped = false,
  isomorphic = false,
  processor = null, // 'postcss' | 'sass'
  test = null,
  type = 'css',
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

  const styleRule = {
    __type: type,
    test,
    use: extract
      ? ExtractTextPlugin.extract({
        fallback: styleLoader,
        use: loaders
      })
      : [styleLoader].concat(loaders)
  }
  return styleRule
}

const rules = {
  esLint() {
    return {
      __type: 'EsLint',
      enforce: 'pre',
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'eslint-loader',
    }
  },

  graphql() {
    return {
      __type: 'GraphQL',
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      loader: 'graphql-tag/loader',
    }
  },

  babel({ test, options }) {
    return {
      __type: 'Babel',
      test,
      exclude: /(node_modules|bower_components)/,
      loader: 'babel-loader',
      // babel will read options here and merge it with .babelrc file
      options
    }
  },

  typescript({ test, babelOptions }) {
    return {
      __type: 'TypeScript',
      test,
      use: [
        {
          loader: 'babel-loader',
          options: babelOptions
        },
        {
          loader: 'ts-loader'
        }
      ]
    }
  },

  sass(config) {
    const { globalFileExt, scoped } = config
    const processor = 'sass'
    const type = 'sass'
    const config2 = _.assign({}, config, {
      processor,
      type,
      globalFileExt: globalFileExt || 'global'
    })
    if (scoped) {
      const testLocal = new RegExp(`^((?!${config2.globalFileExt}).)*\.scss$`)
      const testGlobal = new RegExp(`\.${config2.globalFileExt}.scss$`)
      return [
        makeStyleRule(_.assign({}, config2, {
          scoped: true,
          test: testLocal
        })),
        makeStyleRule(_.assign({}, config2, {
          scoped: false,
          test: testGlobal
        })),
      ]
    }
    return makeStyleRule(_.assign({}, config2, {
      scoped: false,
      test: /\.scss$/
    }))
  },

  css(config) {
    return makeStyleRule(_.assign({}, config, {
      test: /\.css$/,
      processor: config.postcss ?  'postcss' : null
    }))
  },

  image() {
    return {
      __type: 'Image',
      test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: 'media/[name].[hash:8].[ext]',
      },
    }
  },

  file() {
    return {
      __type: 'File',
      exclude: [/\.js$/, /\.html$/, /\.json$/],
      loader: 'file-loader',
      options: {
        name: 'media/[name].[hash:8].[ext]',
      },
    }
  }
}

module.exports = rules
