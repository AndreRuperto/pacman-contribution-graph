import { Store } from '../store.js';
import { Game } from '../game.js';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const username = 'AndreRuperto'; // Coloque aqui seu username do GitHub

Store.config = {
    platform: 'github',
    username,
    outputFormat: 'svg',
    gameSpeed: 1,
    gameTheme: 'github',
    enableSounds: false,
    canvas: {} as HTMLCanvasElement, // solução fake
    pointsIncreasedCallback: () => {},
  
    svgCallback: (animatedSVG) => {
      const outputPath = path.resolve('dist', 'pacman.svg');
      writeFileSync(outputPath, animatedSVG, 'utf-8');
      console.log(`✅ SVG gerado com sucesso em ${outputPath}`);
    },
  
    gameOverCallback: () => {
      console.log('🎮 Game over (modo SVG finalizado)');
    },
  };      

Game.startGame(Store);