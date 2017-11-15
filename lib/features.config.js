const essDep = ['webpack']
const babelDep = ['babel-core', 'babel-loader', 'babel-plugin-lodash', 'babel-preset-es2015']
const cssDep = ['isomorphic-style-loader', 'css-loader', 'style-loader']

exports.essDep = essDep
exports.babelDep = babelDep
exports.cssDep = cssDep
exports.features = {
  polyfill: {
    dep: ['babel-polyfill']
  },
  compress: {

  },
  node: {

  },

  // rules related
  css: {
    rule: 'css',
    priority: 1,
    defaultRuleConfig: {
      postcss: false,
      sourceMap: true
    },
    dep: cssDep
  },
  postcss: {
    rule: 'css',
    priority: 2,
    defaultRuleConfig: {
      postcss: true,
      sourceMap: true
    },
    dep: [...cssDep, 'postcss', 'postcss-cssnext', 'postcss-import', 'postcss-loader']
  },
  sass: {
    rule: 'sass',
    priority: 1,
    dep: ['sass-loader', 'node-sass'],
    defaultRuleConfig: {
      sourceMap: true
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
    dep: ['ts-loader']
  },
  media: {
    
  }
}
