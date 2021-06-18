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
          target: [ 'chrome88', 'firefox86' ]
        }
      },
      {
        test: /\.jsonc$/,
        use: 'json5-loader',
        type: 'javascript/auto'
      }
    ]
  },
  experiments: {
    syncWebAssembly: true
  },
  plugins: [
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.API_ENDPOINT': JSON.stringify('http://localhost:3000')
    })
  ],
  devServer: {
    contentBase: [
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