// webpack.prod.js
import * as path from 'path';
import { fileURLToPath } from 'node:url';

// Manualmente definir __dirname em ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: 'production',

  entry: './src/index.ts',
  target: 'node20',

  output: {
    filename: 'pacman-contribution-graph.min.js',
    path: path.resolve(__dirname, 'dist'),
    module: true,
    clean: true,
    library: {
      type: 'module'
    }
  },

  experiments: {
    outputModule: true
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

  stats: 'minimal'
};