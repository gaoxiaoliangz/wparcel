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
  react: {
    rule: 'babel',
    priority: 2,
    dep: [...babelDep, 'babel-preset-react', 'react', 'react-dom'],
    defaultRuleConfig: {
      babelrc: {
        presets: [
          'es2015',
          'react'
        ]
      }
    }
  },
  typescript: {
    rule: 'typescript',
    priority: 1,
    dep: ['ts-loader']
  },
  sass: {
    rule: 'sass',
    priority: 1,
    dep: ['sass-loader', 'node-sass']
  },
  compress: {

  },
  node: {

  },
  babel: {
    rule: 'babel',
    priority: 1,
    dep: babelDep
  },
  postcss: {
    rule: 'css',
    priority: 2,
    defaultRuleConfig: {
      postcss: true,
    },
    dep: [...cssDep, 'postcss', 'postcss-cssnext', 'postcss-import', 'postcss-loader']
  },
  css: {
    rule: 'css',
    priority: 1,
    defaultRuleConfig: {
      postcss: false,
      sourceMap: true
    },
    dep: cssDep
  }
}
