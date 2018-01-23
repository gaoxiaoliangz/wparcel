const ExtractTextPlugin = require('extract-text-webpack-plugin')
const { resolveProject } = require( '../utils')

const generateStyleRule = ({
  extract = false,
  // if set to 'true', global css can still be imported as import './style.css?global'
  scoped = false,
  isomorphic = false,
  preprocessor = null, // 'postcss' | 'sass'
  test = null,
  scopedClassName,
  __type = null,
}) => {
  const styleLoader = isomorphic ? 'isomorphic-style-loader' : 'style-loader'

  const cssLoader = identName => ({
    loader: 'css-loader',
    options: {
      // OptimizeCssAssetsPlugin will remove source map anyway
      sourceMap: true,
      modules: true,
      // importLoaders
      // https://github.com/webpack-contrib/css-loader/issues/228#issuecomment-204607491
      importLoaders: 1,
      localIdentName: identName
    }
  })

  const preprocessors = [
    ...preprocessor === 'postcss' ? [{
      loader: 'postcss-loader',
      options: {
        plugins() {
          return [
            require(resolveProject('node_modules/postcss-import'))(),
            require(resolveProject('node_modules/postcss-cssnext'))(),
          ]
        }
      }
    }] : [],
    ...preprocessor === 'sass' ? [{
      loader: 'sass-loader'
    }] : [],
  ]

  const use = identName => extract
    ? ExtractTextPlugin.extract({
      fallback: styleLoader,
      use: [
        cssLoader(identName),
        ...preprocessors
      ]
    })
    : [
      styleLoader,
      cssLoader(identName),
      ...preprocessors
    ]


  if (!scoped) {
    return {
      __type,
      test,
      use: use('[local]')
    }
  }

  return {
    __type,
    test,
    oneOf: [
      {
        resourceQuery: /global/,
        use: use('[local]')
      },
      {
        use: use(scopedClassName),
      }
    ]
  }
}

exports.generateStyleRule = generateStyleRule
