const essDep = ['webpack']
const babelDep = [
  'babel-core',
  'babel-loader',
  'babel-preset-env',
  'babel-preset-react',
  'babel-plugin-lodash',
  'babel-plugin-transform-class-properties',
  'babel-plugin-transform-object-rest-spread',
  'babel-plugin-syntax-dynamic-import'
]
const cssDep = ['isomorphic-style-loader', 'css-loader', 'style-loader']
const postcssDep = ['postcss-loader', 'postcss-import', 'postcss-cssnext']
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
  postcssDep,
  filenames,
  ruleExclude,
  scopedClassName
}
