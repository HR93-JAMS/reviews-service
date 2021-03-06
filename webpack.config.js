var path = require('path');
var SRC_DIR = path.join(__dirname, './client/src');
var DIST_DIR = path.join(__dirname, './client/dist');

module.exports = {
  entry: `${SRC_DIR}/index.js`,
  output: {
    filename: 'bundle.min.js',
    path: DIST_DIR
  },
  mode: 'production',
  module: {
    rules: [{
      test: /\.jsx?/,
      include: SRC_DIR,
      loader: 'babel-loader',
      query: {
        presets: ['react', 'es2015'],
      },
    },
    {
      test: /\.css$/,
      loader: 'style-loader!css-loader',
      // {
      //   loader: 'css-loader',
      //   options: {
      //     sourceMap: true,
      //     modules: true,
      //     localIdentName: '[local]___[hash:base64:5]',
      //   },
      // },
      
      },
    ],
  },
};