const essDep = ['webpack']
const babelDep = ['babel-core', 'babel-loader', 'babel-plugin-lodash', 'babel-preset-es2015']
const cssDep = ['isomorphic-style-loader', 'css-loader', 'style-loader']
const tsconfig = `
{
  "compilerOptions": {
    "allowSyntheticDefaultImports": true,
    "allowJs": true,
    "target": "es2015",
    "jsx": "react",
    "outDir": "dist",
    "experimentalDecorators": true,
    "moduleResolution": "node",
    "noImplicitAny": false,
    "sourceMap": true
  },
  "exclude": [
    "node_modules"
  ],
  "include": [
    "src"
  ]
}
`

exports.essDep = essDep
exports.babelDep = babelDep
exports.cssDep = cssDep
exports.tsconfig = tsconfig
