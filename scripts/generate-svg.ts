// src/scripts/generate-svg.ts
import { Store } from '../store.js';
import { Game } from '../game.js';
import { Grid } from '../grid.js';
import { fetchGithubContributionsGraphQL } from '../github-contributions.js';

import { writeFileSync, mkdirSync } from 'fs';
import * as path from 'path';

/* -------------------------------------------------------------------------- */
/* 1. Configurações básicas                                                   */
/* -------------------------------------------------------------------------- */
const username = 'AndreRuperto';
const accessToken = process.env.GITHUB_TOKEN!; // ⬅︎ troque depois!

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
    const out = path.join(dist, 'pacman-novo1.svg');
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
  Store.contributions = await fetchGithubContributionsGraphQL(
    Store
  );

  // 3.2 – monta paredes e roda o jogo
  Grid.buildWalls();
  await Game.startGame(Store);
})().catch((err) => {
  console.error('❌  Erro ao gerar SVG:', err);
  process.exit(1);
});