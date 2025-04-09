import { Store } from '../store.js';
import { Game } from '../game.js';
import { Utils } from '../utils.js';
import { writeFileSync } from 'fs';
import { Grid } from '../grid.js'; // ajuste o caminho conforme seu projeto
import { fetchGithubContributionsGraphQL } from '../github-contributions.js';
import * as path from 'path';

const username = 'AndreRuperto';

Store.config = {
  platform: 'github',
  username,
  outputFormat: 'svg',
  gameSpeed: 1,
  gameTheme: 'github-dark',
  enableSounds: false,
  canvas: {} as HTMLCanvasElement,
  pointsIncreasedCallback: () => {},
  /*githubSettings: {
    accessToken: '', // mantenha seu token aqui
  },*/
  svgCallback: (animatedSVG) => {
    const outputPath = path.resolve('dist', 'pacman.svg');
    writeFileSync(outputPath, animatedSVG, 'utf-8');
    console.log(`✅ SVG animado com barrinhas gerado com sucesso em ${outputPath}`);
  },
  gameOverCallback: () => {
    console.log('🎮 Game over');
  },
};

fetchGithubContributionsGraphQL(username, Store.config!.githubSettings!.accessToken!)
.then((contributions) => {
  Store.contributions = contributions;

  Utils.buildGrid(Store);
  Utils.buildMonthLabels(Store);
  Grid.buildWalls();
  Game.startGame(Store);
});