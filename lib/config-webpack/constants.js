const essDep = ['webpack']
const babelDep = ['babel-core', 'babel-loader', 'babel-plugin-lodash', 'babel-preset-react-app', 'babel-plugin-syntax-dynamic-import']
const cssDep = ['isomorphic-style-loader', 'css-loader', 'style-loader']
const filenames = {
  js: 'js/[name]-[hash:8].[ext]',
  css: 'css/[name]-[hash:8].css',
  img: 'img/[name]-[hash:8].[ext]',
  file: 'file/[name]-[hash:8].[ext]'
}
const ruleExclude = /node_modules/
const scopedClassName = '[local]--[hash:base64:5]'

module.exports = {
  essDep,
  babelDep,
  cssDep,
  filenames,
  ruleExclude,
  scopedClassName
}
