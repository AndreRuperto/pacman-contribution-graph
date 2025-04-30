import path from 'path';
import { fileURLToPath } from 'url';
import { merge } from 'webpack-merge';
import common from './webpack.common.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default merge(common, {
  mode: 'production',
  output: {
    filename: 'pacman-contribution-graph.min.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'module', // ← muda para ESM
    },
    clean: true,
  },
  experiments: {
    outputModule: true, // ← necessário para 'type: module'
  }
});