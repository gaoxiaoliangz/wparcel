const _ = require('lodash')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

// const generateStyleRule = ({
//   extract = false,
//   // if set to 'true', global css can still be imported as import './style.css?global'
//   scoped = false,
//   isomorphic = false,
//   preprocessor = null, // 'postcss' | 'sass'
//   test = null,
//   __type = null,
// }) => {
//   const styleLoader = isomorphic ? 'isomorphic-style-loader' : 'style-loader'
//   const localIdentName = !scoped ? '[local]' : '[local]_[hash:base64:5]'

//   const loaders = [
//     {
//       oneOf: [
//         {
//           resourceQuery: /global/,
//           loader: 'css-loader',
//           options: {
//             // OptimizeCssAssetsPlugin will remove source map anyway
//             sourceMap: true,
//             modules: true,
//             // importLoaders
//             // https://github.com/webpack-contrib/css-loader/issues/228#issuecomment-204607491
//             importLoaders: 1,
//             localIdentName: '[local]'
//           }
//         },
//         {
//           loader: 'css-loader',
//           options: {
//             // OptimizeCssAssetsPlugin will remove source map anyway
//             sourceMap: true,
//             modules: true,
//             // importLoaders
//             // https://github.com/webpack-contrib/css-loader/issues/228#issuecomment-204607491
//             importLoaders: 1,
//             localIdentName: '[local]_[hash:base64:5]'
//           }
//         }
//       ]
//     },
//     ...preprocessor === 'postcss'
//       ? [{
//         loader: 'postcss-loader',
//         options: {
//           plugins: () => [
//             // TODO
//             require('postcss-import')(), // eslint-disable-line
//             require('postcss-cssnext') // eslint-disable-line
//           ]
//         }
//       }]
//       : [],
//     ...preprocessor === 'sass'
//       ? [{
//         loader: 'sass-loader'
//       }]
//       : [],
//   ]

//   return {
//     __type,
//     test,
//     use: extract
//       ? ExtractTextPlugin.extract({
//         fallback: styleLoader,
//         use: loaders
//       })
//       : [styleLoader].concat(loaders)
//   }
// }


const generateStyleRule = ({
  extract = false,
  // if set to 'true', global css can still be imported as import './style.css?global'
  scoped = false,
  isomorphic = false,
  preprocessor = null, // 'postcss' | 'sass'
  test = null,
  __type = null,
}) => {
  const localIdentName = !scoped ? '[local]' : '[local]_[hash:base64:5]'

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

  if (!extract) {
    return {
      __type,
      test,
      oneOf: [
        {
          resourceQuery: /global/,
          use: [
            styleLoader,
            cssLoader('[local]'),
            ...preprocessors
          ]
        },
        {
          use: [
            styleLoader,
            cssLoader('[local]_[hash:base64:5]'),
            ...preprocessors
          ]
        }
      ]
    }
  }

  return {
    __type,
    test,
    oneOf: [
      {
        resourceQuery: /global/,
        use: ExtractTextPlugin.extract({
          fallback: styleLoader,
          use: [
            cssLoader('[local]'),
            ...preprocessors
          ]
        })
      },
      {
        use: ExtractTextPlugin.extract({
          fallback: styleLoader,
          use: [
            cssLoader('[local]_[hash:base64:5]'),
            ...preprocessors
          ]
        })
      }
    ]
  }

  // return {
  //   __type,
  //   test,
  //   use: ExtractTextPlugin.extract({
  //     fallback: styleLoader,
  //     // use: [
  //     //   cssLoader('[local]'),
  //     //   ...preprocessors
  //     // ]
  //     use: [{
  //       oneOf: [
  //         {
  //           resourceQuery: /global/,
  //           use: [
  //             cssLoader('[local]'),
  //             ...preprocessors
  //           ]
  //         },
  //         {
  //           use: [
  //             cssLoader('[local]_[hash:base64:5]'),
  //             ...preprocessors
  //           ]
  //         }
  //       ]
  //     }]
  //   })
  // }
}

// const rules = {
//   sass(config) {
//     const { globalFileExt, scoped } = config
//     const processor = 'sass'
//     const type = 'sass'
//     const config2 = _.assign({}, config, {
//       processor,
//       type,
//       globalFileExt: globalFileExt || 'global'
//     })
//     if (scoped) {
//       const testLocal = new RegExp(`^((?!${config2.globalFileExt}).)*\.scss$`)
//       const testGlobal = new RegExp(`\.${config2.globalFileExt}.scss$`)
//       return [
//         generateStyleRule(_.assign({}, config2, {
//           scoped: true,
//           test: testLocal
//         })),
//         generateStyleRule(_.assign({}, config2, {
//           scoped: false,
//           test: testGlobal
//         })),
//       ]
//     }
//     return generateStyleRule(_.assign({}, config2, {
//       scoped: false,
//       test: /\.scss$/
//     }))
//   },

//   css(config) {
//     return generateStyleRule(_.assign({}, config, {
//       test: /\.css$/,
//       processor: config.postcss ? 'postcss' : null
//     }))
//   },
// }

exports.generateStyleRule = generateStyleRule
