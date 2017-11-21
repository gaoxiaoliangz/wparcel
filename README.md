# webpack-utils

with webpack-utils you can write webpack config files like this, everything you want is defined as features

```js
const { resolveApp, generateConfig } = require('webpack-utils')

module.exports = generateConfig({
  polyfill: true,
  react: true,
  babel: true,
  css: {
    postcss: true
  },
  sass: {
    scoped: true
  },
  disableDepCheck: false,
  production: true,
  excludeExternals: true
}, {
  entry: {
    app: resolveApp('src/index.jsx')
  },
  output: {
    path: resolveApp('dist'),
    filename: '[name].js'
  }
})
```

## util functions

### resolveApp(relativePath)

convert relative path to absolute path

### generateConfig(features, webpackConfig)

## features

object, the features you want to enable, set to `true` or config object to enable, `false` to disable.

### `polyfill`

use babel-polyfill

### `node`

bundle for node env

### `excludeExternals`

exclude `node_modules` from webpack bundle

#### Config

- `config`, default: `{}`, config that applied to webpack-node-externals

### `css` | `sass`

support css/scss file

#### Config

- `sourceMap`, default: `true`
- `extract`, default: `false`, extract to file, if false, css will be injected into head tag
- `scoped`, default: `false`
- `isomorphic`, default: `false`
- `postcss`, default: `false` (css only)

### `babel`

#### Config

- `react`, default: `false`, jsx support

### `typescript`

enable typescript support

### `graphql`

enable *.graphql and *.gql support

### `media` (enabled by default)

enable importing all kinds of files

#### Config

- `loadImgWithUrlLoader`, default: `true`, import image file as base64 to avoid requests

### `production`

Optimize build for production

#### Config

- `compress`, default: `true`

### `verbose`

default: `false`, display detailed webpack info

### `disableDepCheck`

default: `false`, check loader dependency

## `webpackConfig`

the same object as you would use in a normal webpack.config.js, this would override any config `generateConfig` produces.
