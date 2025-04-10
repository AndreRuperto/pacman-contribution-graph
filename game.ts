import { SVG } from './svg.js';
import { StoreType } from './types';
import {
  DELTA_TIME,
  GHOST_NAMES,
  GRID_HEIGHT,
  GRID_WIDTH,
  PACMAN_DEATH_DURATION
} from './constants.js';
import { GhostsMovement } from './movement/ghosts-movement.js';
import { PacmanMovement } from './movement/pacman-movement.js';
import { createGridFromData } from './utils.js';

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
  store.ghosts = [];
  store.ghosts.push({ x: 23, y: 3, name: GHOST_NAMES[0], scared: false, target: undefined });
  store.ghosts.push({ x: 24, y: 3, name: GHOST_NAMES[1], scared: false, target: undefined });
  store.ghosts.push({ x: 27, y: 3, name: GHOST_NAMES[2], scared: false, target: undefined });
  store.ghosts.push({ x: 28, y: 3, name: GHOST_NAMES[3], scared: false, target: undefined });
};

const stopGame = async (store: StoreType) => {
  clearInterval(store.gameInterval);
};

const startGame = async (store: StoreType) => {
  store.frameCount = 0;
  store.ghosts.forEach((ghost) => (ghost.scared = false));

  // ✅ Gera grid com intensidades a partir das contribuições
  store.grid = createGridFromData(store.contributions);

  const remainingCells = () => store.grid.some((row) => row.some((cell) => cell.intensity > 0));
  if (remainingCells()) {
    placePacman(store);
    placeGhosts(store);
  }

  if (store.config.outputFormat == 'svg') {
    while (remainingCells()) {
      await updateGame(store);
    }
    await updateGame(store);
  } else {
    clearInterval(store.gameInterval);
    store.gameInterval = setInterval(async () => await updateGame(store), DELTA_TIME);
  }
};

const updateGame = async (store: StoreType) => {
  store.frameCount++;
  if (store.frameCount % store.config.gameSpeed !== 0) {
    store.gameHistory.push({
      pacman: { ...store.pacman },
      ghosts: store.ghosts.map((ghost) => ({ ...ghost })),
      grid: store.grid.map((row) => row.map((col) => ({ ...col })))
    });
    return;
  }

  if (store.pacman.deadRemainingDuration) {
    store.pacman.deadRemainingDuration--;
    if (!store.pacman.deadRemainingDuration) {
      placeGhosts(store);
    }
  }

  if (store.pacman.powerupRemainingDuration) {
    store.pacman.powerupRemainingDuration--;
    if (!store.pacman.powerupRemainingDuration) {
      store.ghosts.forEach((ghost) => (ghost.scared = false));
      store.pacman.points = 0;
    }
  }

  const remainingCells = store.grid.some((row) => row.some((cell) => cell.intensity > 0));
  if (!remainingCells) {
    if (store.config.outputFormat == 'svg') {
      const animatedSVG = SVG.generateAnimatedSVG(store);
      store.config.svgCallback(animatedSVG);
    }

    store.config.gameOverCallback();
    return;
  }

  PacmanMovement.movePacman(store);
  const cell = store.grid[store.pacman.x]?.[store.pacman.y];
  if (cell && cell.intensity >= 0.8 && !store.pacman.powerupRemainingDuration) {
    store.pacman.powerupRemainingDuration = 30;
    store.ghosts.forEach((ghost) => (ghost.scared = true));
  }

  checkCollisions(store);
  if (!store.pacman.deadRemainingDuration) {
    GhostsMovement.moveGhosts(store);
    checkCollisions(store);
  }

  store.pacmanMouthOpen = !store.pacmanMouthOpen;

  store.gameHistory.push({
    pacman: { ...store.pacman },
    ghosts: store.ghosts.map((ghost) => ({ ...ghost })),
    grid: store.grid.map((row) => row.map((col) => ({ ...col })))
  });
};

const checkCollisions = (store: StoreType) => {
  if (store.pacman.deadRemainingDuration) return;

  store.ghosts.forEach((ghost, index) => {
    if (ghost.x === store.pacman.x && ghost.y === store.pacman.y) {
      if (store.pacman.powerupRemainingDuration && ghost.scared) {
        respawnGhost(store, index);
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
  let x, y;
  do {
    x = Math.floor(Math.random() * GRID_WIDTH);
    y = Math.floor(Math.random() * GRID_HEIGHT);
  } while ((Math.abs(x - store.pacman.x) <= 2 && Math.abs(y - store.pacman.y) <= 2) || store.grid[x][y].intensity === 0);
  store.ghosts[ghostIndex] = {
    x,
    y,
    name: GHOST_NAMES[ghostIndex % GHOST_NAMES.length],
    scared: false,
    target: undefined
  };
};

export const Game = {
  startGame,
  stopGame
};