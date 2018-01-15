# jellyweb

A webpack based packing tool that makes your development easier

<!-- TOC -->

- [jellyweb](#jellyweb)
  - [Getting started](#getting-started)
  - [Cli Commands](#cli-commands)
  - [Provided functions](#provided-functions)
    - [resolveProject(relativePath)](#resolveprojectrelativepath)
    - [configWebpack(features, webpackConfig)](#configwebpackfeatures-webpackconfig)
  - [webpack.config.js](#webpackconfigjs)
    - [Example](#example)
    - [features](#features)
      - [`polyfill`](#polyfill)
      - [`node`](#node)
      - [`excludeExternals`](#excludeexternals)
        - [Config](#config)
      - [`css` | `sass`](#css--sass)
        - [Config](#config-1)
      - [`babel`](#babel)
        - [Config](#config-2)
      - [`typescript`](#typescript)
      - [`graphql`](#graphql)
      - [`media` (enabled by default)](#media-enabled-by-default)
        - [Config](#config-3)
      - [`production`](#production)
        - [Config](#config-4)
      - [`verbose`](#verbose)
      - [`disableDepCheck`](#disabledepcheck)

<!-- /TOC -->

## Getting started

install `jellyweb`
```
$ npm install jellyweb
$ npm install --global jellyweb
```

run
```
$ jellyweb init
```

webpack config and dev server config will be generated.
Add index.js to src, and index.html to the root.

```
$ jellyweb serve
```
And you are good to go.

## Cli Commands

| Command | Description                                        | options                                                                      |
| ------- | -------------------------------------------------- | ---------------------------------------------------------------------------- |
| init    | generate config files                              | `--ts`: generate tsconfig.json                                               |
| serve   | start webpack dev server                           | `--ncc`: do not clear console, `--nob`: do not open browser on first compile |
| build   | bundle asset files                                 |                                                                              |
| run     | run jellyweb tasks, eg: `jellyweb run tasks/hi.js` |                                                                              |
| --help  | show help docs                                     |                                                                              |

## Provided functions

You can `import { resolveProject, configWebpack } from 'jellyweb'` to access these functions.

### resolveProject(relativePath)

convert relative path to absolute path

### configWebpack(features, webpackConfig)

`features`: explained below

`webpackConfig`: the same object as you would use in a normal webpack.config.js, this would override any config `generateConfig` produces.

## webpack.config.js

jellyweb generated webpack config files use `configWebpack` to abstract away the complexity of webpack config files. Everything is defined as features, suche babel, sass, media.

You can enable or disable them as you wish. With jellyweb, you no longer need to struggle with tedious webpack config to get a tiny feature, but just config them as all sorts of handy common featues. And if anything you want is not provided by jellyweb, you can still define them in webpack config, jellyweb will merge them with the features you defined for you.

### Example

webpack.config.js

```js
const { resolveProject, configWebpack } = require('jellyweb')

module.exports = configWebpack({
  polyfill: true,
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
    app: resolveProject('src/index.jsx')
  },
  output: {
    path: resolveProject('dist'),
    filename: '[name].js'
  }
})
```

### features

object, the features you want to enable, set to `true` or config object to enable, `false` to disable.

If a feature is set to `true`, default values under config will be used, if set to object, then this object will be merged with default config.

#### `polyfill`

use babel-polyfill

#### `node`

bundle for node env

#### `excludeExternals`

exclude `node_modules` from webpack bundle

##### Config

it is applied directly to webpack-node-externals

- `whitelist`, default: `[]`, include packages in the build

#### `css` | `sass`

support css/scss file

##### Config

- `sourceMap`, default: `true`
- `extract`, default: `false`, extract to file, if false, css will be injected into head tag
- `scoped`, default: `false`
- `isomorphic`, default: `false`
- `postcss`, default: `false` (css only)

#### `babel`

##### Config

- `babelrc`, default with `es2015` preset, if this is present, default config or react config will be overridden
- `react`, default: `false`, use `react-app` babel preset

#### `typescript`

enable typescript support

#### `graphql`

enable *.graphql and *.gql support

#### `media` (enabled by default)

enable importing all kinds of files

##### Config

- `dataUrl`, default: `true`, import image file as base64 to avoid requests

#### `production`

add production optimizations for the build

##### Config

- `compress`, default: `true`

#### `verbose`

default: `false`, display detailed webpack info

#### `disableDepCheck`

default: `false`, check loader dependency
