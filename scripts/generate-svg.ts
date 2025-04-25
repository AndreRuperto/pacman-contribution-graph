// src/scripts/generate-svg.ts
import { Store } from '../store.js';
import { Game } from '../game.js';
import { Grid } from '../grid.js';
import { fetchGithubContributionsGraphQL } from '../github-contributions.js';

import { writeFileSync, mkdirSync } from 'fs';
import * as path from 'path';
import 'dotenv/config';

/* -------------------------------------------------------------------------- */
/* 1. Configurações básicas                                                   */
/* -------------------------------------------------------------------------- */

const username = process.env.GITHUB_USERNAME!;
const accessToken = process.env.GITHUB_TOKEN!;

if (!username || !accessToken) {
  throw new Error('Variáveis GITHUB_USERNAME e GITHUB_TOKEN não estão definidas no .env');
}

/* -------------------------------------------------------------------------- */
/* 2. Store.config                                                            */
/* -------------------------------------------------------------------------- */
Store.config = {
  platform: 'github',
  username,
  outputFormat: 'svg',
  gameSpeed: 1,
  gameTheme: 'github-dark',
  enableSounds: false,
  canvas: {} as HTMLCanvasElement,     // não usado para SVG
  pointsIncreasedCallback: () => {},
  githubSettings: { accessToken },
  svgCallback: (svg) => {
    const dist = path.resolve('dist');
    mkdirSync(dist, { recursive: true });
    const out = path.join(dist, 'pacman.svg');
    writeFileSync(out, svg, 'utf-8');
    console.log(`✅  SVG animado salvo em ${out}`);
  },
  gameOverCallback: () => console.log('🎮  Game over – SVG pronto!'),
} as const;

console.log("🎨 Tema selecionado:", Store.config.gameTheme);

/* -------------------------------------------------------------------------- */
/* 3. Pipeline principal                                                      */
/* -------------------------------------------------------------------------- */
(async () => {
  // 3.1 – baixa contribuições
  Store.contributions = await fetchGithubContributionsGraphQL(Store, username, accessToken);

  // 3.2 – monta paredes
  Grid.buildWalls();

  // 3.3 – inicia jogo e gera SVG internamente
  await Game.startGame(Store);

  // ✅ Log para debug: Verifica se fantasmas estão sendo colocados
  console.log("👻 Fantasmas no final:", Store.ghosts);
  if (!Store.ghosts.length) {
    console.warn("⚠️ Nenhum fantasma foi encontrado após startGame!");
  }
})().catch((err) => {
  console.error('❌  Erro ao gerar SVG:', err);
  process.exit(1);
});