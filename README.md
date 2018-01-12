# jellyweb

## Getting started

install `jellyweb`
```
$ yarn add jellyweb
```

run
```
$ jellyweb
```
and webpack.config.js is generated with default features

You can enable or disable them as you wish. With jellyweb, you no longer need to struggle with tedious webpack config to get a tiny feature, but just config them as all sorts of handy common featues. And if anything you want is not provided by jellyweb, you can still define them in webpack config, jellyweb will merge them with the features you defined for you.

## Example

webpack.config.js

```js
const { resolveApp, generateConfig } = require('jellyweb')

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

## Provided functions

You can `import { resolveApp, generateConfig } from 'jellyweb'` to access these functions.

### resolveApp(relativePath)

convert relative path to absolute path

### generateConfig(features, webpackConfig)

## features

object, the features you want to enable, set to `true` or config object to enable, `false` to disable.

If a feature is set to `true`, default values under config will be used, if set to object, then this object will be merged with default config.

### `polyfill`

use babel-polyfill

### `node`

bundle for node env

### `excludeExternals`

exclude `node_modules` from webpack bundle

#### Config

it is applied directly to webpack-node-externals

- `whitelist`, default: `[]`, include packages in the build

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

- `babelrc`, default with `es2015` preset, if this is present, default config or react config will be overridden
- `react`, default: `false`, use `react-app` babel preset

### `typescript`

enable typescript support

### `graphql`

enable *.graphql and *.gql support

### `media` (enabled by default)

enable importing all kinds of files

#### Config

- `dataUrl`, default: `true`, import image file as base64 to avoid requests

### `production`

add production optimizations for the build

#### Config

- `compress`, default: `true`

### `verbose`

default: `false`, display detailed webpack info

### `disableDepCheck`

default: `false`, check loader dependency

## `webpackConfig`

the same object as you would use in a normal webpack.config.js, this would override any config `generateConfig` produces.
