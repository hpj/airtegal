const { DefinePlugin } = require('webpack');

const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

const smp = new SpeedMeasurePlugin();

const webpackConfig = smp.wrap({
  devtool: 'source-map',
  entry: './src/index.js',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'esbuild-loader',
        /** @type { import('esbuild').TransformOptions } */
        options: {
          loader: 'jsx',
          target: [ 'chrome96' ]
        }
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
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
      'process.env.API_ENDPOINT': JSON.stringify('http://localhost:3000'),
      'process.env.RELEASE': JSON.stringify('development')
    })
  ],
  devServer: {
    client: {
      overlay: false,
    },
    static: [
      __dirname + '/src/mocks',
      __dirname + '/public',
    ],
    historyApiFallback: true,
    hot: true
  },
  output: {
    publicPath: '/',
    filename: 'bundle.js',
    path: __dirname + '/public'
  }
});

module.exports = webpackConfig;