# webpack-utils

with webpack-utils you can write webpack config files like this, everything you want is defined as features

```js
const { resolveApp, generateConfig } = require('webpack-utils')

module.exports = generateConfig({
  features: {
    react: true,
    css: true,
    sass: {
      scoped: true
    },
    typescript: true,
    media: true
  }
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

### generateConfig(config, webpackConfig)

- `config.features`, object, the features you want to enable, set to `true` or config object to enable, `false` to disable.
- `webpackConfig`, the same object as you would use in a normal webpack.config.js, this would override any config `generateConfig` produces.

## Features

### `polyfill`

use babel-polyfill

### `node`

bundle for node env

### `css` | `postcss` | `sass`

support css file

#### Config

- `sourceMap`, default: `true`
- `extract`, default: `false`, extract to file, if false, css will be injected into head tag
- `scoped`, default: `false`
- `isomorphic`, default: `false`

### `babel`

### Config

- `babelrc`, default with `es2015` preset

## `react`

enable jsx support

## `typescript`

enable typescript support

## `graphql`

enable *.graphql and *.gql support

## `media` (enabled by default)

enable importing all kinds of files

### Config

- `loadImgWithUrlLoader`, default: `true`, import image file as base64 to avoid requests
