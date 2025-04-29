// webpack.action.js
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: 'production',
  target: 'node20',
  entry: './github-action/src/index.ts',
  output: {
    path: path.resolve(__dirname, 'github-action/dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',   // <<<< ESSA LINHA IMPORTANTE
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