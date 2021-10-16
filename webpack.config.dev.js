const { DefinePlugin } = require('webpack');

module.exports = {
  devtool: 'source-map',
  entry: './src/index.js',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'esbuild-loader',
        options: {
          loader: 'jsx',
          target: [ 'chrome92' ]
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
      'process.env.API_ENDPOINT': JSON.stringify('http://localhost:3000'),
      'process.env.RELEASE': JSON.stringify('development')
    })
  ],
  devServer: {
    client: {
      overlay: false,
    },
    static: [
      __dirname + '/public',
      __dirname + '/src/mocks',
    ],
    historyApiFallback: true,
    hot: true
  },
  output: {
    path: __dirname + '/public',
    publicPath: '/',
    filename: 'bundle.js'
  }
};