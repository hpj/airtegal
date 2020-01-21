const { DefinePlugin } = require('webpack');

const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

module.exports = (env) => ({
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
      'process.env.KBF_API_KEY': env.KBF_API_KEY,
      'process.env.HOST': env.HOST,
      'process.env.PORT': env.PORT
    }),
    new BrowserSyncPlugin({
      notify: false,
      open: false,
      port: 8081,
      ghostMode: false,
      proxy: 'http://localhost:8080'
    })
  ],
  devServer: {
    contentBase: './public',
    historyApiFallback: true,
    hot: true
  },
  output: {
    path: __dirname + '/public',
    publicPath: '/',
    filename: 'bundle.js'
  }
});