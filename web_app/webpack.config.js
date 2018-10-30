var webpack = require('webpack');

module.exports = {
  entry: {
    route: './client/route.js',
    overview: './client/overview.js',
    routeInformation: './client/routeInformation.js',
    util: './client/util.js',
  },
  output: {
    path: __dirname + '/public',
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,	//all .js files
        loader: 'babel-loader'	//babel-loader transbribes new JS to supportable JS
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    })
  ]
};
