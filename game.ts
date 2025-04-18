import { SVG } from './svg.js';
import { StoreType, GhostName } from './types';
import {
  DELTA_TIME,
  GHOST_NAMES,
  GRID_HEIGHT,
  GRID_WIDTH,
  PACMAN_DEATH_DURATION
} from './constants.js';
import { GhostsMovement } from './movement/ghosts-movement.js';
import { PacmanMovement } from './movement/pacman-movement.js';
import { Utils } from './utils.js';

let frame = 0;

const placePacman = (store: StoreType) => {
  store.pacman = {
    x: 0,
    y: 0,
    direction: 'right',
    points: 0,
    totalPoints: 0,
    deadRemainingDuration: 0,
    powerupRemainingDuration: 0,
    recentPositions: []
  };
};

const placeGhosts = (store: StoreType) => {
	store.ghosts = [
		{ x: 26, y: 2, name: 'blinky', direction: 'left', scared: false, target: undefined, inHouse: false }, // fora
		{ x: 25, y: 3, name: 'inky', direction: 'up', scared: false, target: undefined, inHouse: true },
		{ x: 26, y: 3, name: 'pinky', direction: 'up', scared: false, target: undefined, inHouse: true },
		{ x: 27, y: 3, name: 'clyde', direction: 'up', scared: false, target: undefined, inHouse: true }
	];
};

const stopGame = async (store: StoreType) => {
  clearInterval(store.gameInterval as number);
};

const startGame = async (store: StoreType) => {
  store.frameCount = 0;
  store.ghosts.forEach((ghost) => (ghost.scared = false));

  store.grid = Utils.createGridFromData(store);

  const remainingCells = () =>
    store.grid.some((row) => row.some((cell) => cell.commitsCount > 0));

  if (remainingCells()) {
    placePacman(store);
    placeGhosts(store);
  }  

  if (store.config.outputFormat === 'svg') {
    while (remainingCells()) {
      // Liberar fantasmas em frames específicos
      if (frame === 10) releaseGhostFromHouse(store, 'pinky');  // ~3000ms com DELTA_TIME
      if (frame === 20) releaseGhostFromHouse(store, 'inky');   // ~6000ms
      if (frame === 30) releaseGhostFromHouse(store, 'clyde');  // ~9000ms
      
      await updateGame(store);
      frame++;
    }
    // Uma atualização final após todos os pontos serem coletados
    await updateGame(store);
  } else {
    // Para o modo canvas, usar setTimeout
    setTimeout(() => releaseGhostFromHouse(store, 'pinky'), 3000);
    setTimeout(() => releaseGhostFromHouse(store, 'inky'), 6000);
    setTimeout(() => releaseGhostFromHouse(store, 'clyde'), 9000);
    
    clearInterval(store.gameInterval as number);
    store.gameInterval = setInterval(() => updateGame(store), DELTA_TIME) as unknown as number;
  }
};

// Adicionando uma nova função para reiniciar o Pacman
const resetPacman = (store: StoreType) => {
  store.pacman.x = 27;
  store.pacman.y = 7;
  store.pacman.direction = 'right';
  store.pacman.recentPositions = [];
  // Qualquer outra propriedade que você queira redefinir
};

const updateGame = async (store: StoreType) => {
  store.frameCount++;

  if (store.frameCount % store.config.gameSpeed !== 0) {
    store.gameHistory.push({
      pacman: { ...store.pacman },
      ghosts: store.ghosts.map((g) => ({ ...g })),
      grid: store.grid.map((row) => row.map((col) => ({ ...col })))
    });
    return;
  }

  if (store.pacman.deadRemainingDuration > 0) {
    store.pacman.deadRemainingDuration--;
    if (store.pacman.deadRemainingDuration === 0) {
      // Usar a função de reset para o Pacman
      resetPacman(store);
      
      // Reposicionar os fantasmas
      placeGhosts(store);
      frame = 0;
    }
  }

  if (store.pacman.powerupRemainingDuration > 0) {
    store.pacman.powerupRemainingDuration--;
    if (store.pacman.powerupRemainingDuration === 0) {
      store.ghosts.forEach((g) => (g.scared = false));
      store.pacman.points = 0;
    }
  }

  const remaining = store.grid.some((row) => row.some((c) => c.commitsCount > 0));
  if (!remaining) {
    if (store.config.outputFormat === 'svg') {
      const animatedSVG = SVG.generateAnimatedSVG(store);
      store.config.svgCallback(animatedSVG);
    }

    store.config.gameOverCallback();
    return;
  }

  PacmanMovement.movePacman(store);
  const cell = store.grid[store.pacman.x]?.[store.pacman.y];

  if (cell && cell.level === 'FOURTH_QUARTILE' && store.pacman.powerupRemainingDuration === 0) {
    store.pacman.powerupRemainingDuration = 30;
    store.ghosts.forEach((g) => (g.scared = true));
  }
  
  checkCollisions(store);

  if (store.pacman.deadRemainingDuration === 0) {
    GhostsMovement.moveGhosts(store);
    checkCollisions(store);
  }

  store.pacmanMouthOpen = !store.pacmanMouthOpen;

  store.gameHistory.push({
    pacman: { ...store.pacman },
    ghosts: store.ghosts.map((g) => ({ ...g })),
    grid: store.grid.map((row) => row.map((col) => ({ ...col })))
  });
};

export const determineGhostName = (index: number): GhostName => {
  const ghostNames: GhostName[] = ['blinky', 'inky', 'pinky', 'clyde'];
  return ghostNames[index % ghostNames.length];
};

const checkCollisions = (store: StoreType) => {
  if (store.pacman.deadRemainingDuration) return;

  store.ghosts.forEach((ghost, i) => {
    if (ghost.x === store.pacman.x && ghost.y === store.pacman.y) {
      // Ignore colisões com fantasmas que já estão em modo de olhos
      if (ghost.name === 'eyes') return;
      
      if (store.pacman.powerupRemainingDuration && ghost.scared) {
        // Salvar o nome original do fantasma antes de transformá-lo em olhos
        ghost.originalName = ghost.name;
        
        // Transformar em olhos e definir comportamento de respawn
        ghost.name = 'eyes';
        ghost.scared = false;
        
        // Definir destino como a casa dos fantasmas
        ghost.target = { x: 26, y: 3 };
        
        store.pacman.points += 10;
      } else {
        store.pacman.points = 0;
        store.pacman.powerupRemainingDuration = 0;
        store.pacman.deadRemainingDuration = PACMAN_DEATH_DURATION;
      }
    }
  });
};

const respawnGhost = (store: StoreType, ghostIndex: number) => {
  const ghost = store.ghosts[ghostIndex];
  
  // Transformar o fantasma em olhos
  ghost.name = 'eyes';
  ghost.scared = false;
  
  // Definir a posição de respawn (casa dos fantasmas)
  const respawnPosition = { x: 26, y: 3 }; // Centro da casa dos fantasmas
  
  // Definir o target do fantasma como a posição de respawn
  ghost.target = respawnPosition;
  
  // Quando chegar à posição de respawn, voltar à forma original
  store.ghosts[ghostIndex].isRespawning = true;
  
  // Aumento na pontuação por comer um fantasma
  store.pacman.points += 10;
};

const releaseGhostFromHouse = (store: StoreType, name: GhostName) => {
  const ghost = store.ghosts.find((g) => g.name === name && g.inHouse);
  if (ghost) {
      ghost.inHouse = false;
      ghost.y = 2; // posição fora da casa
      ghost.direction = 'up'; // direção inicial explícita
      console.log(`Released ghost ${name} with direction ${ghost.direction}`);
  }
};

export const Game = {
  startGame,
  stopGame
};