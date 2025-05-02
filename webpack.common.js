// webpack.common.js
const path = require('path');

module.exports = {
  entry: './src/index.ts',
  target: 'node20',

  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },

  externalsPresets: { node: true },
  externals: [],

  resolve: {
    extensionAlias: {
      '.js': ['.ts', '.js']
    },
    extensions: ['.ts', '.js']
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
};