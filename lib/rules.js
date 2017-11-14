const makeScssRule = (config) => {
  const defaultStyleRuleConfig = {
    sourceMap: true,
    extract: true,
    global: false,
    isomorphic: false
  }
  const ruleConfig = _.assign({}, defaultStyleRuleConfig, config)
  const { test, isomorphic, global, extract, sourceMap } = ruleConfig
  const styleLoader = isomorphic ? 'isomorphic-style-loader' : 'style-loader'
  const localIdentName = global ? '[local]' : vars.cssLocalIdentName

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
    {
      loader: 'sass-loader'
    }
  ]

  return {
    test,
    use: extract
      ? ExtractTextPlugin.extract({
        fallback: styleLoader,
        use: loaders,
        publicPath: paths.publicPath
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

  es() {
    return {
      test: /\.(js|jsx|mjs)$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'babel-loader'
    }
  },

  typescript({ babelConfig } = {}) {
    const _babelConfig = isDebug
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
          options: {
            babelrc: false,
            ...(babelConfig || _babelConfig)
          }
        },
        {
          loader: 'ts-loader'
        }
      ]
    }
  },

  sass({ isomorphic, extract, sourceMap, encapsulation, globalFileExt }) {
    if (encapsulation) {
      const testLocal = new RegExp(`^((?!${globalFileExt}).)*\.scss$`)
      const testGlobal = new RegExp(`\.${globalFileExt}.scss$`)
      return [
        makeScssRule({ isomorphic, extract, sourceMap, global: false, test: testLocal }),
        makeScssRule({ isomorphic, extract, sourceMap, global: true, test: testGlobal }),
      ]
    }
    return makeScssRule({ isomorphic, extract, sourceMap, global: true, test: /\.scss$/ })
  },

  scssLocal({ isomorphic, extract, sourceMap }) {
    return makeScssRule({
      // treat it as local if 'global' is not in filename
      // possible issue:
      // filename like global.examle.scss will be ommitted by both global and local rules
      test: /^((?!global).)*\.scss$/,
      isomorphic,
      extract,
      sourceMap,
      global: false
    })
  },

  scssGlobal({ isomorphic, extract, sourceMap }) {
    return makeScssRule({
      test: /\.global.scss$/,
      isomorphic,
      extract,
      sourceMap,
      global: true
    })
  },

  css({ isomorphic, global, extract, sourceMap }) {
    const styleLoader = isomorphic ? 'isomorphic-style-loader' : 'style-loader'
    const localIdentName = global ? '[local]' : vars.cssLocalIdentName

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
      {
        loader: 'postcss-loader',
        options: {
          plugins: () => [
            require('postcss-import')(), // eslint-disable-line
            require('postcss-cssnext') // eslint-disable-line
          ]
        }
      },
    ]

    return {
      test: /\.css$/,
      use: extract
        ? ExtractTextPlugin.extract({
          fallback: styleLoader,
          use: loaders,
          publicPath: paths.publicPath
        })
        : [styleLoader].concat(loaders)
    }
  },

  img({ emitFile } = { emitFile: true }) {
    const emitFileConfig = emitFile ? 'emitFile=true' : 'emitFile=false'

    return {
      test: /\.(jpe?g|png|gif|svg)$/i,
      use: [
        `file-loader?name=${vars.mediaFilename}&${emitFileConfig}`
      ]
    }
  }
}

module.exports = rules
