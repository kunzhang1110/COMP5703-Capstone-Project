module.exports = {
  entry: './src/index.js',
  output: {
    path: __dirname + '/public',
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,	//all .js files
        loader: 'babel-loader'	//babel-loader transbribes new JS to supportable JS
      }
    ]
  }
};
