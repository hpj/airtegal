const { DefinePlugin } = require('webpack');

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
        test: /\.(json|jsonc|json5)$/,
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
      'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`
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