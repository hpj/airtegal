const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [ 'babel-loader' ]
      }
    ]
  },
  resolve: {
    extensions: [ '*', '.js', '.jsx' ]
  },
  plugins: [
    new BrowserSyncPlugin({
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
};