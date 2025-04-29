import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nodeExternals from 'webpack-node-externals';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

export default {
  mode: 'production',
  target: 'node20',

  entry: './github-action/src/index.ts',

  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'github-action', 'dist'),
    library: { type: 'commonjs2' },
    clean: true
  },

  externalsPresets: { node: true },
  externals: [nodeExternals()],

  resolve: {
    extensions: ['.ts', '.js']
  },

  module: {
    rules: [{ test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ }]
  },

  stats: 'minimal'
};