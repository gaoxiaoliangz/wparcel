import path from 'path'
import _ from 'lodash'
// import VueLoaderPlugin from 'vue-loader/lib/plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { resolvePathInProject } from './utils'

export interface GenerateWebpackConfigOptions {
  webpackEnv: 'development' | 'production'
  htmlFilePath?: string
  analysis?: boolean
  servedPath?: string
  buildPath?: string
}

const defaultOptions: Partial<GenerateWebpackConfigOptions> = {
  htmlFilePath: path.resolve(__dirname, '../static/index.html'),
  analysis: false,
  servedPath: '/',
  buildPath: 'dist',
}

const getFilename = (absFilePath: string) => {
  if (absFilePath.endsWith('.html')) {
    return _.last(absFilePath.split('/'))
  }
  throw new Error(`invalid html file path "${absFilePath}"`)
}

export default (options: GenerateWebpackConfigOptions) => {
  const { webpackEnv, htmlFilePath, analysis, servedPath, buildPath } = {
    ...defaultOptions,
    ...options,
  }
  const isEnvDevelopment = webpackEnv === 'development'
  const isEnvProduction = webpackEnv === 'production'

  const publicPath = isEnvProduction ? servedPath : isEnvDevelopment && '/'

  return {
    entry: {
      index: resolvePathInProject('./src/index.js'),
    },
    output: {
      // The build folder.
      path: isEnvProduction ? resolvePathInProject(buildPath) : undefined,
      // Add /* filename */ comments to generated require()s in the output.
      pathinfo: isEnvDevelopment,
      // There will be one main bundle, and one file per asynchronous chunk.
      // In development, it does not produce real files.
      filename: isEnvProduction
        ? 'static/js/[name].[contenthash:8].js'
        : isEnvDevelopment && 'static/js/bundle.js',
      chunkFilename: isEnvProduction
        ? 'static/js/[name].[contenthash:8].chunk.js'
        : isEnvDevelopment && 'static/js/[name].chunk.js',
      publicPath,
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          include: resolvePathInProject('./src'),
          loader: require.resolve('babel-loader'),
          options: {
            babelrc: false,
            // plugins: [require.resolve('babel-plugin-transform-vue-jsx')],
          },
        },
        // {
        //   test: /\.vue$/,
        //   loader: require.resolve('vue-loader'),
        // },
        {
          test: /\.(sc|c|sa)ss$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: process.env.NODE_ENV === 'development',
              },
            },
            require.resolve('css-loader'),
            require.resolve('sass-loader'),
          ],
        },
        {
          test: /\.(svg|otf|ttf|woff2?|eot|gif|png|jpe?g)(\?\S*)?$/,
          loader: require.resolve('url-loader'),
          query: {
            limit: 1000 * 1024, // 1mb 是文件大小上限，超过了会被抽出
            name: path.posix.join('static', '[name].[hash:7].[ext]'),
          },
        },
      ],
    },
    performance: {
      hints: false,
    },
    resolve: {
      extensions: ['.vue', '.js', '.jsx', '.json'],
      symlinks: false,
    },
    plugins: [
      // new VueLoaderPlugin(),
      new MiniCssExtractPlugin(),
      new HtmlWebpackPlugin({
        // title: 'Custom template',
        // Load a custom template (lodash by default)
        template: htmlFilePath,
        // chunks: 'all',
        // chunks: ['index'],
        // filename: 'test/index.html',
        filename: getFilename(htmlFilePath),
      }),
      // new HtmlWebpackInjector(),
      ...(analysis && [
        new BundleAnalyzerPlugin({
          analyzerPort: 8022,
        }),
      ]),
    ].filter(Boolean),
    mode: 'production',
    optimization: {
      minimize: false,
    },
    stats: {
      colors: true,
      hash: false,
      version: false,
      timings: false,
      assets: false,
      chunks: false,
      modules: false,
      reasons: false,
      children: false,
      source: false,
      errors: true,
      errorDetails: true,
      warnings: true,
      publicPath: false,
    },
    // devtool: 'source-map',
  }
}
