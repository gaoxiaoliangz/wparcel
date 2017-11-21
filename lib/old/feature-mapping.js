const makeFeature = ({ defaultConfig, mapFn, dependency }) => {
  return {
    defaultConfig,
    mapFn, // (config, context) => { [target: string]: {value(targetConfig), priority: number} }
    dependency,
  }
}

const featureMapping = {
  polyfill: makeFeature({
    defaultConfig: false,
    dependency: ['babel-polyfill']
  }),
  css: makeFeature({
    defaultConfig: {
      postcss: true,
      sourceMap: true,
      extract: false,
      scoped: false,
      isomorphic: true,
      postcss: false
    },
    mapFn: (input, context) => {
      const isProduction = context.production
      const config = Object.assign({}, input, {
        sourceMap: !isProduction,
        extract: isProduction
      })
      return {
        'rules:css': {
          value: config,
          priority: 1
        }
      }
    },
    dependency: [...cssDep, 'postcss', 'postcss-cssnext', 'postcss-import', 'postcss-loader']
  }),
  production: makeFeature({
    defaultConfig: false,
    mapFn: input => {
      return input && {
        'webpack:plugins': {
          value: [
            new webpack.DefinePlugin({
              'process.env.NODE_ENV': JSON.stringify('production')
            }),
            new webpack.optimize.UglifyJsPlugin({
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
            }),
            new OptimizeCssAssetsPlugin({
              assetNameRegExp: /\.css$/g,
              cssProcessor: require('cssnano'), // eslint-disable-line
              cssProcessorOptions: {
                discardComments: { removeAll: true },
                zindex: false
              },
              canPrint: true
            }),
            new WebpackMd5Hash(),
            new ExtractTextPlugin({
              filename: '[name].css',
              disable: false,
              allChunks: true
            })
          ],
          priority: 5
        }
      }
    },
  })
}

module.exports = featureMapping
