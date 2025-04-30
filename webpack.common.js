// webpack.common.js
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: './src/index.ts',
  target: 'node20',

  output: {
    // Isto será sobrescrito no webpack.prod.js
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