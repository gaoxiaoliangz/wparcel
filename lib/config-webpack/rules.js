const _ = require('lodash')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const { filenames } = require('./constants')

const makeStyleRule = ({
  extract = false,
  scoped = false,
  isomorphic = false,
  preprocessor = null, // 'postcss' | 'sass'
  test = null,
  type = null,
}) => {
  const styleLoader = isomorphic ? 'isomorphic-style-loader' : 'style-loader'
  const localIdentName = !scoped ? '[local]' : '[local]_[hash:base64:5]'

  const loaders = [
    {
      loader: 'css-loader',
      options: {
        // OptimizeCssAssetsPlugin will remove source map anyway
        sourceMap: true,
        modules: true,
        // importLoaders
        // https://github.com/webpack-contrib/css-loader/issues/228#issuecomment-204607491
        importLoaders: 1,
        localIdentName
      }
    },
    ...preprocessor === 'postcss'
      ? [{
        loader: 'postcss-loader',
        options: {
          plugins: () => [
            // TODO
            require('postcss-import')(), // eslint-disable-line
            require('postcss-cssnext') // eslint-disable-line
          ]
        }
      }]
      : [],
    ...preprocessor === 'sass'
      ? [{
        loader: 'sass-loader'
      }]
      : [],
  ]

  return {
    __type: type,
    test,
    use: extract
      ? ExtractTextPlugin.extract({
        fallback: styleLoader,
        use: loaders
      })
      : [styleLoader].concat(loaders)
  }
}

const rules = {
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
      processor: config.postcss ? 'postcss' : null
    }))
  },
}

module.exports = rules
