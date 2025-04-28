import path from 'node:path';
import nodeExternals from 'webpack-node-externals';

/** @type {import('webpack').Configuration} */
export default {
  mode: 'production',

  entry: './src/index.ts',
  target: 'node20',

  output: {
    filename: 'index.js',
    path: path.resolve('github-action/dist'),
    clean: true,
    module: true, // ← ATIVA saída ESModule
    library: {
      type: 'module'
    }
  },

  experiments: {
    outputModule: true // ← IMPORTANTE: permite gerar como ESModule
  },

  externalsPresets: { node: true },
  externals: [nodeExternals()],

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