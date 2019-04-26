const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const resolvePackagePath = relPath => path.resolve(process.cwd(), relPath)

module.exports = {
  output: {
    path: resolvePackagePath('./lib'),
    publicPath: '/lib/',
    filename: '[name].js',
    chunkFilename: '[id].js',
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: resolvePackagePath('./src'),
        loader: require.resolve('babel-loader'),
        options: {
          babelrc: false,
          plugins: [require.resolve('babel-plugin-transform-vue-jsx')],
        },
      },
      {
        test: /\.vue$/,
        loader: require.resolve('vue-loader'),
      },
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
  plugins: [new VueLoaderPlugin(), new MiniCssExtractPlugin()],
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
