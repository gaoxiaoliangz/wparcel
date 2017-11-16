const essDep = ['webpack']
const babelDep = ['babel-core', 'babel-loader', 'babel-plugin-lodash', 'babel-preset-es2015']
const cssDep = ['isomorphic-style-loader', 'css-loader', 'style-loader']

exports.essDep = essDep
exports.babelDep = babelDep
exports.cssDep = cssDep
exports.features = ({ isProduction = false }) => ({
  polyfill: {
    dep: ['babel-polyfill']
  },
  compress: {

  },
  node: {

  },

  lodash: {

  },

  production: {
    compress: true,
  },

  // rules related
  css: {
    rule: 'css',
    priority: 1,
    defaultRuleConfig: {
      postcss: false,
      sourceMap: !isProduction,
      extract: isProduction,
    },
    dep: cssDep
  },
  postcss: {
    rule: 'css',
    priority: 2,
    defaultRuleConfig: {
      postcss: true,
      sourceMap: !isProduction,
      extract: isProduction,
    },
    // todo
    dep: [...cssDep, 'postcss', 'postcss-cssnext', 'postcss-import', 'postcss-loader']
  },
  sass: {
    rule: 'sass',
    priority: 1,
    dep: ['sass-loader', 'node-sass'],
    defaultRuleConfig: {
      sourceMap: !isProduction,
      extract: isProduction,
    },
  },
  babel: {
    rule: 'babel',
    priority: 1,
    dep: babelDep
  },
  react: {
    rule: 'babel',
    priority: 2,
    dep: [...babelDep, 'babel-preset-react-app', 'react', 'react-dom'],
    defaultRuleConfig: {
      babelrc: {
        presets: [
          'react-app'
        ]
      }
    }
  },
  typescript: {
    rule: 'typescript',
    priority: 1,
    dep: ['ts-loader', 'typescript']
  },
  graphql: {
    rule: 'graphql',
    priority: 1,
    dep: ['graphql-tag']
  },
  media: {
    enableByDefault: true,
    loadImgWithUrlLoader: true,
    dep: ['url-loader', 'file-loader']
  }
})
