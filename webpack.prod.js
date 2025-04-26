import path from 'node:path';
import nodeExternals from 'webpack-node-externals';

/** @type {import('webpack').Configuration} */
export default {
  mode: 'production',

  // ponto de entrada da Action (em TypeScript)
  entry: './src/index.ts',

  // garante runtime Node 20 (mesma versão dos runners mais novos)
  target: 'node20',

  output: {
    filename: 'index.js',                // arquivo que o GitHub Action vai executar
    path: path.resolve('github-action/dist'),
    libraryTarget: 'commonjs2',          // formato que a runtime do GitHub entende
    clean: true                          // apaga build anterior
  },

  // não empacotar dependências nativas ou node‑modules
  externalsPresets: { node: true },
  externals: [nodeExternals()],

  resolve: {
    // quando encontrar `import './foo.js'`, tente primeiro ./foo.ts ➜ ./foo.js
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

  // log mais enxuto
  stats: 'minimal'
};
