module.exports = {
  entry: './src/index.js',
  devtool: 'source-map',
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