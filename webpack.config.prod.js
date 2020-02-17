const { DefinePlugin } = require('webpack');

const GitRevisionPlugin = require('git-revision-webpack-plugin');

const SentryWebpackPlugin = require('@sentry/webpack-plugin');

const CompressionPlugin = require('compression-webpack-plugin');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const gitRevisionPlugin = new GitRevisionPlugin();

module.exports = {
  devtool: 'source-map',
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [ 'babel-loader' ]
      },
      {
        test: /\.json$/,
        use: 'json5-loader',
        type: 'javascript/auto'
      }
    ]
  },
  resolve: {
    extensions: [ '*', '.js', '.jsx' ]
  },
  plugins: [
    new DefinePlugin({
      'process.env.RELEASE': gitRevisionPlugin.commithash(),
      'process.env.API_ENDPOINT': process.env.API_ENDPOINT
    }),
    new SentryWebpackPlugin({
      include: '.',
      release: gitRevisionPlugin.commithash(),
      configFile: 'sentry.properties',
      ignoreFile: '.sentrycliignore',
      ignore: [ 'node_modules' ]
    }),
    new CompressionPlugin({
      filename: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0.8
    }),
    new CompressionPlugin({
      filename: '[path].br[query]',
      algorithm: 'brotliCompress',
      test: /\.(js|css|html|svg)$/,
      compressionOptions: { level: 11 },
      threshold: 10240,
      minRatio: 0.8
    }),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [],
      cleanAfterEveryBuildPatterns: [ __dirname + '/public/bundle.js.map' ]
    })
  ],
  output: {
    path: __dirname + '/public',
    publicPath: '/',
    filename: 'bundle.js'
  }
};