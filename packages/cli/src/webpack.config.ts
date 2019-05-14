import path from 'path'
import _ from 'lodash'
// import VueLoaderPlugin from 'vue-loader/lib/plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { resolvePathInProject, getFilename } from './utils'
import paths from './config/paths'

export interface GenerateWebpackConfigOptions {
  webpackEnv: WebpackEnv
  htmlFilePathAbs?: string
  analysis?: boolean
  servedPath?: string
  outDir: string
  entry: any
}

const defaultOptions: Partial<GenerateWebpackConfigOptions> = {
  analysis: false,
  servedPath: '/',
}

export default (options: GenerateWebpackConfigOptions) => {
  const { entry, webpackEnv, htmlFilePathAbs, analysis, servedPath, outDir } = {
    ...defaultOptions,
    ...options,
  }
  const isEnvDevelopment = webpackEnv === 'development'
  const isEnvProduction = webpackEnv === 'production'

  const publicPath = isEnvProduction ? servedPath : isEnvDevelopment && '/'

  return {
    entry,
    output: {
      // The build folder.
      path: isEnvProduction ? resolvePathInProject(outDir) : undefined,
      // Add /* filename */ comments to generated require()s in the output.
      pathinfo: isEnvDevelopment,
      // There will be one main bundle, and one file per asynchronous chunk.
      // In development, it does not produce real files.
      filename: isEnvProduction
        ? `${paths.assetFolder}/js/[name].[contenthash:8].js`
        : isEnvDevelopment && `${paths.assetFolder}/js/bundle.js`,
      chunkFilename: isEnvProduction
        ? `${paths.assetFolder}/js/[name].[contenthash:8].chunk.js`
        : isEnvDevelopment && `${paths.assetFolder}/js/[name].chunk.js`,
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
            name: path.posix.join(paths.assetFolder, '[name].[hash:7].[ext]'),
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
      ...(htmlFilePathAbs && [
        new HtmlWebpackPlugin({
          // Load a custom template (lodash by default)
          template: htmlFilePathAbs,
          filename: getFilename(htmlFilePathAbs),
        }),
      ]),
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
