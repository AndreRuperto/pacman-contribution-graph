// webpack.prod.js
const path = require('path');
const { fileURLToPath } = require('url');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  output: {
    filename: 'pacman-contribution-graph.min.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'commonjs',
    },
  },
});