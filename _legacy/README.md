# jellyweb

A webpack based web application bundler that makes your life easier

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

jellyweb config and dev server config will be generated.
Add index.js to src, and index.html to the root.

```
$ jellyweb serve
```
And you are good to go.

## Cli Commands

| Command       | Options             | Description                                        |
|---------------|---------------------|----------------------------------------------------|
| init          |                     | generate config files                              |
| serve         |                     | start webpack dev server                           |
| \             | `--config`          | set config file path                               |
| \             | `--devServerConfig` | set dev server config path                         |
| \             | `--ncc`             | do not clear console                               |
| \             | `--nob`             | do not open browser on first compile               |
| build         |                     | bundle asset files                                 |
| \             | `--config`          | set config file path                               |
| run           |                     | run jellyweb tasks, eg: `jellyweb run tasks/hi.js` |
| --help, -h    |                     | show help docs and feature configs                 |
| --version, -v |                     | show version                                       |

## Provided functions

You can `import { resolveProject, configWebpack } from 'jellyweb'` to access these functions.

### resolveProject(relativePath)

convert relative path to absolute path

### configWebpack(features, webpackConfig)

`features`: details explained below, the same as what you will define under jellyweb.config.js

`webpackConfig`: the same object as you would use in a normal webpack.config.js, this would have a higher priority than what `configWebpack` produces.

## jellyweb.config.js

jellyweb generated webpack config files use `configWebpack` to abstract away the complexity of webpack config files. Everything is defined as `features`, such as babel, sass, media, etc.

You can enable or disable them as you wish. With jellyweb, you no longer need to struggle with tedious webpack config to get a tiny feature, but just config them as all sorts of handy common features. And if anything you want is not provided by jellyweb, you can still define them in webpack config, jellyweb will merge them with the features you defined for you.

### Example

jellyweb.config.js

```js
const { resolveProject } = require('jellyweb')

module.exports = {
  entry: {
    main: resolveProject('src/index.js'),
  },
  output: {
    path: resolveProject('build'),
    filename: '[name].js',
    publicPath: '/static/'
  },
  devtool: 'sourcemap',
  features: {
    babel: true,
    define: {},
    css: true,
    media: {
      dataUrl: true
    },
    production: false,
  }
}
```

### features

`object`, the features you want to enable, set `true` or config object to enable, `false` to disable.

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

- `test`, test reg for rule
- `scoped`, default: `false`
- `postcss`, default: `false`

#### `babel`

##### Config

- `test`, test reg for rule
- `options`, default with `babel-preset-react-app` preset and plugins: `babel-plugin-syntax-dynamic-import`, `babel-plugin-lodash`

#### `typeScript`

enable typescript support

- `test`, test reg for rule
- `babelOptions`, default with plugins: `babel-plugin-syntax-dynamic-import`, `babel-plugin-lodash`

#### `graphQL`

enable *.graphql and *.gql support

##### Config

- `test`, test reg for rule

#### `media` (enabled by default)

enable importing all kinds of files

##### Config

- `dataUrl`, default: `true`, import image file as base64 to avoid requests
- `imageTest`, test reg for image files
- `imageOptions`, default: { limit: 1000, name: 'img/[name]-[hash:8].[ext]' }
- `fileOptions`, default: { name: 'file/[name]-[hash:8].[ext]' }

#### `splitVendor`

split external dependencies into a vendor js file

### presets

A preset is a collection of features

#### `production`

`md5Hash`, `compress`, `extract-css`

### Other Config

#### production

`boolean`, if set to `true`, `process.env.NODE_ENV` will be `production`

#### scopedClassName

default: `[local]--[hash:base64:5]`

When css or sass is enabled with `scoped` set to `true`, this config will take effect, and the class on the dom will be replaced with the naming rule defined by this config.
