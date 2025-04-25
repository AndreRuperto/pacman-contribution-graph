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

/* ---------- helpers de posicionamento ---------- */

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
      { x: 26, y: 2, name: 'blinky', direction: 'left', scared: false, target: undefined, inHouse: false},
      { x: 25, y: 3, name: 'inky',   direction: 'up',   scared: false, target: undefined, inHouse: true},
      { x: 26, y: 3, name: 'pinky',  direction: 'down', scared: false, target: undefined, inHouse: true},
      { x: 27, y: 3, name: 'clyde',  direction: 'up',   scared: false, target: undefined, inHouse: true}
  ];

  // reset extras
  store.ghosts.forEach(g => {
      g.confusionFrames       = 0;
      g.justReleasedFromHouse = false;
      g.respawnCounter        = 0;
      g.isRespawning          = false;
      
      // Configurar direções diferentes para criar um efeito de movimento assíncrono
      if (g.inHouse) {
          // Distribuir as direções iniciais para não ficarem todos sincronizados
          if (g.name === 'inky') g.direction = 'up';
          else if (g.name === 'pinky') g.direction = 'down';
          else if (g.name === 'clyde') g.direction = 'up';
      }
  });
};

/* ---------- ciclo principal ---------- */

const stopGame = async (store: StoreType) => {
  clearInterval(store.gameInterval as number);
};

const startGame = async (store: StoreType) => {
  store.frameCount   = 0;
  store.gameHistory  = [];             // mantém limpeza
  store.ghosts.forEach(g => (g.scared = false));

  store.grid = Utils.createGridFromData(store);

  const remainingCells = () =>
    store.grid.some(row => row.some(cell => cell.commitsCount > 0));

  if (remainingCells()) {
    placePacman(store);
    placeGhosts(store);
  }

  if (store.config.outputFormat === 'svg') {
    while (remainingCells()) {
      // libera fantasmas
      if (frame === 10) releaseGhostFromHouse(store, 'pinky');
      if (frame === 20) releaseGhostFromHouse(store, 'inky');
      if (frame === 30) releaseGhostFromHouse(store, 'clyde');

      await updateGame(store);
      frame++;
    }
    // snapshot final
    await updateGame(store);
  } else {
    // canvas
    setTimeout(() => releaseGhostFromHouse(store, 'pinky'), 3000);
    setTimeout(() => releaseGhostFromHouse(store, 'inky'),  6000);
    setTimeout(() => releaseGhostFromHouse(store, 'clyde'), 9000);

    clearInterval(store.gameInterval as number);
    store.gameInterval = setInterval(() => updateGame(store), DELTA_TIME) as unknown as number;
  }
};

/* ---------- utilidades ---------- */

const resetPacman = (store: StoreType) => {
  store.pacman.x = 27;
  store.pacman.y = 7;
  store.pacman.direction = 'right';
  store.pacman.recentPositions = [];
};

export const determineGhostName = (index: number): GhostName => {
  const names: GhostName[] = ['blinky', 'inky', 'pinky', 'clyde'];
  return names[index % names.length];
};

/* ---------- update por frame ---------- */

const updateGame = async (store: StoreType) => {
  store.frameCount++;

  /* ---- FRAME-SKIP restaurado ---- */
  if (store.frameCount % store.config.gameSpeed !== 0) {
    pushSnapshot(store);
    return;
  }

  /* -------- timers pacman -------- */
  if (store.pacman.deadRemainingDuration > 0) {
    store.pacman.deadRemainingDuration--;
    if (store.pacman.deadRemainingDuration === 0) {
      resetPacman(store);
      placeGhosts(store);
      frame = 0;
    }
  }

  if (store.pacman.powerupRemainingDuration > 0) {
    store.pacman.powerupRemainingDuration--;
    if (store.pacman.powerupRemainingDuration === 0) {
      store.ghosts.forEach(g => { if (g.name !== 'eyes') g.scared = false; });
      store.pacman.points = 0;
    }
  }

  /* -- respawn fantasmas (sem mudanças) -- */
  store.ghosts.forEach(ghost => {
    if (ghost.inHouse && ghost.respawnCounter && ghost.respawnCounter > 0) {
      ghost.respawnCounter--;
      if (ghost.respawnCounter === 0) {
        ghost.name   = ghost.originalName || determineGhostName(store.ghosts.indexOf(ghost));
        ghost.inHouse = false;
        ghost.isRespawning = false;
        ghost.scared = store.pacman.powerupRemainingDuration > 0;
        ghost.justReleasedFromHouse = true;
        ghost.confusionFrames = 30;
      }
    }
  });

  /* -------- fim de jogo -------- */
  const remaining = store.grid.some(row => row.some(c => c.commitsCount > 0));
  if (!remaining) {
    if (store.config.outputFormat === 'svg') {
      const svg = SVG.generateAnimatedSVG(store);
      store.config.svgCallback(svg);
    }
    store.config.gameOverCallback();
    return;
  }

  /* -------- movimentos -------- */
  PacmanMovement.movePacman(store);

  const cell = store.grid[store.pacman.x]?.[store.pacman.y];
  if (cell && cell.level === 'FOURTH_QUARTILE' && store.pacman.powerupRemainingDuration === 0) {
    store.pacman.powerupRemainingDuration = 30;
    store.ghosts.forEach(g => { if (g.name !== 'eyes') g.scared = true; });
  }

  checkCollisions(store);

  if (store.pacman.deadRemainingDuration === 0) {
    GhostsMovement.moveGhosts(store);
    checkCollisions(store);
  }

  store.pacmanMouthOpen = !store.pacmanMouthOpen;

  /* ---- único snapshot por frame ---- */
  pushSnapshot(store);
};

/* ---------- snapshot helper ---------- */
const pushSnapshot = (store: StoreType) => {
  store.gameHistory.push({
    pacman: { ...store.pacman },
    ghosts: store.ghosts.map(g => ({ ...g })),
    grid:   store.grid.map(row => row.map(col => ({ ...col })))
  });
};

/* ---------- colisões & house ---------- */

const checkCollisions = (store: StoreType) => {
  if (store.pacman.deadRemainingDuration) return;

  store.ghosts.forEach(ghost => {
    // Se o fantasma for olhos, não deve haver colisão
    if (ghost.name === 'eyes') return;
    
    if (ghost.x === store.pacman.x && ghost.y === store.pacman.y) {
      if (store.pacman.powerupRemainingDuration && ghost.scared) {
        ghost.originalName = ghost.name;
        ghost.name = 'eyes';
        ghost.scared = false;
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

const releaseGhostFromHouse = (store: StoreType, name: GhostName) => {
  const ghost = store.ghosts.find(g => g.name === name && g.inHouse);
  if (ghost) {
    ghost.justReleasedFromHouse = true;
    ghost.y = 2;
    ghost.direction = 'up';
    ghost.justReleasedFromHouse = true;
    ghost.confusionFrames = 30;
  }
};

export const Game = { startGame, stopGame };