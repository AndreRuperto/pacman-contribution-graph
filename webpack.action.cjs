// webpack.action.cjs
const path = require('path');

module.exports = {
  mode: 'production',
  target: 'node20',
  entry: './github-action/src/index.ts',
  output: {
    path: path.resolve(__dirname, 'github-action/dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',   // ← ESSENCIAL pra GitHub Actions!
  },
  resolve: {
    extensions: ['.ts', '.js'],
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
  externalsPresets: { node: true },
};