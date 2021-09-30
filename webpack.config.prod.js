const zlib = require('zlib');

const { DefinePlugin } = require('webpack');

const { GitRevisionPlugin } = require('git-revision-webpack-plugin');

const CompressionPlugin = require('compression-webpack-plugin');

const gitRevisionPlugin = new GitRevisionPlugin();

module.exports = {
  devtool: 'source-map',
  entry: './src/index.js',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'esbuild-loader',
        options: {
          loader: 'jsx',
          target: [ 'chrome90', 'safari12', 'firefox88' ]
        }
      },
      {
        test: /\.jsonc$/,
        use: 'json5-loader',
        type: 'javascript/auto'
      }
    ]
  },
  plugins: [
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.API_ENDPOINT': JSON.stringify('https://api.airtegal.me'),
      'process.env.RELEASE': JSON.stringify(gitRevisionPlugin.commithash())
    }),
    new CompressionPlugin({
      filename: '[path][base].gz',
      algorithm: 'gzip',
      test: /\.js$/,
      threshold: 10240,
      minRatio: 0.8
    }),
    new CompressionPlugin({
      filename: '[path][base].br',
      algorithm: 'brotliCompress',
      test: /\.js$/,
      compressionOptions: {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 11
        }
      },
      threshold: 10240,
      deleteOriginalAssets: false,
      minRatio: 0.8
    })
  ],
  output: {
    path: __dirname + '/public',
    publicPath: '/',
    filename: 'bundle.js'
  }
};