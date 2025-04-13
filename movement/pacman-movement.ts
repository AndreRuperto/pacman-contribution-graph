import { GRID_HEIGHT, GRID_WIDTH, PACMAN_POWERUP_DURATION } from '../constants.js';
import { Point2d, StoreType } from '../types.js';
import { MovementUtils } from './movement-utils.js';
import { Utils } from '../utils.js';

const RECENT_POSITIONS_LIMIT = 5;

const movePacman = (store: StoreType) => {
	if (store.pacman.deadRemainingDuration) return;

	const hasPowerup = !!store.pacman.powerupRemainingDuration;
	const scaredGhosts = store.ghosts.filter((ghost) => ghost.scared);

	let targetPosition: Point2d;

	if (hasPowerup && scaredGhosts.length > 0) {
		const ghostPosition = findClosestScaredGhost(store);
		targetPosition = ghostPosition ?? findOptimalTarget(store);
	} else if (store.pacman.target) {
		if (store.pacman.x === store.pacman.target.x && store.pacman.y === store.pacman.target.y) {
			targetPosition = findOptimalTarget(store);
			store.pacman.target = targetPosition;
		} else {
			targetPosition = store.pacman.target;
		}
	} else {
		targetPosition = findOptimalTarget(store);
		store.pacman.target = targetPosition;
	}

	const nextPosition = calculateOptimalPath(store, targetPosition);
	nextPosition ? updatePacmanPosition(store, nextPosition) : makeDesperationMove(store);

	checkAndEatPoint(store);
};

const findClosestScaredGhost = (store: StoreType) => {
	const scaredGhosts = store.ghosts.filter((g) => g.scared);
	if (scaredGhosts.length === 0) return null;

	return scaredGhosts.reduce(
		(closest, ghost) => {
			const distance = MovementUtils.calculateDistance(ghost.x, ghost.y, store.pacman.x, store.pacman.y);
			return distance < closest.distance ? { x: ghost.x, y: ghost.y, distance } : closest;
		},
		{ x: store.pacman.x, y: store.pacman.y, distance: Infinity }
	);
};

const findOptimalTarget = (store: StoreType) => {
	const pointCells: { x: number; y: number; value: number }[] = [];

	for (let x = 0; x < GRID_WIDTH; x++) {
		for (let y = 0; y < GRID_HEIGHT; y++) {
			const cell = store.grid[x][y];
			if (cell.level !== 'NONE') {
				const distance = MovementUtils.calculateDistance(x, y, store.pacman.x, store.pacman.y);
				const value = cell.commitsCount / (distance + 1);
				pointCells.push({ x, y, value });
			}
		}
	}

	pointCells.sort((a, b) => b.value - a.value);
	return pointCells[0];
};

const calculateOptimalPath = (store: StoreType, target: Point2d) => {
	const queue: { x: number; y: number; path: Point2d[]; score: number }[] = [
		{ x: store.pacman.x, y: store.pacman.y, path: [], score: 0 }
	];
	const visited = new Set<string>([`${store.pacman.x},${store.pacman.y}`]);
	const dangerMap = createDangerMap(store);

	while (queue.length > 0) {
		queue.sort((a, b) => b.score - a.score);
		const current = queue.shift()!;
		const { x, y, path } = current;

		if (x === target.x && y === target.y) {
			return path.length > 0 ? path[0] : null;
		}

		for (const [dx, dy] of MovementUtils.getValidMoves(x, y)) {
			const newX = x + dx;
			const newY = y + dy;
			const key = `${newX},${newY}`;

			if (!visited.has(key)) {
				const newPath = [...path, { x: newX, y: newY }];
				const danger = dangerMap.get(key) || 0;
				const pointValue = store.grid[newX][newY].commitsCount;
				const distanceToTarget = MovementUtils.calculateDistance(newX, newY, target.x, target.y);
				const revisitPenalty = store.pacman.recentPositions?.includes(key) ? 100 : 0;

				queue.push({
					x: newX,
					y: newY,
					path: newPath,
					score: pointValue - danger - distanceToTarget / 10 - revisitPenalty
				});
				visited.add(key);
			}
		}
	}

	return null;
};

const createDangerMap = (store: StoreType) => {
	const map = new Map<string, number>();
	const hasPowerup = !!store.pacman.powerupRemainingDuration;

	store.ghosts.forEach((ghost) => {
		if (ghost.scared) return;

		for (let dx = -5; dx <= 5; dx++) {
			for (let dy = -5; dy <= 5; dy++) {
				const x = ghost.x + dx;
				const y = ghost.y + dy;

				if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
					const key = `${x},${y}`;
					const distance = Math.abs(dx) + Math.abs(dy);
					const value = 15 - distance;

					if (value > 0) {
						const current = map.get(key) || 0;
						map.set(key, Math.max(current, value));
					}
				}
			}
		}
	});

	if (hasPowerup) {
		for (const [key, value] of map.entries()) {
			map.set(key, value / 5);
		}
	}

	return map;
};

const makeDesperationMove = (store: StoreType) => {
	const validMoves = MovementUtils.getValidMoves(store.pacman.x, store.pacman.y);
	if (validMoves.length === 0) return;

	const safest = validMoves.reduce(
		(best, [dx, dy]) => {
			const newX = store.pacman.x + dx;
			const newY = store.pacman.y + dy;
			let minDist = Infinity;

			store.ghosts.forEach((ghost) => {
				if (!ghost.scared) {
					const dist = MovementUtils.calculateDistance(ghost.x, ghost.y, newX, newY);
					minDist = Math.min(minDist, dist);
				}
			});

			return minDist > best.distance ? { dx, dy, distance: minDist } : best;
		},
		{ dx: 0, dy: 0, distance: -Infinity }
	);

	updatePacmanPosition(store, {
		x: store.pacman.x + safest.dx,
		y: store.pacman.y + safest.dy
	});
};

const updatePacmanPosition = (store: StoreType, position: Point2d) => {
	store.pacman.recentPositions ||= [];
	store.pacman.recentPositions.push(`${position.x},${position.y}`);
	if (store.pacman.recentPositions.length > RECENT_POSITIONS_LIMIT) {
		store.pacman.recentPositions.shift();
	}

	const dx = position.x - store.pacman.x;
	const dy = position.y - store.pacman.y;

	store.pacman.direction =
		dx > 0 ? 'right' :
		dx < 0 ? 'left' :
		dy > 0 ? 'down' :
		dy < 0 ? 'up' : store.pacman.direction;

	store.pacman.x = position.x;
	store.pacman.y = position.y;
};

const checkAndEatPoint = (store: StoreType) => {
	const cell = store.grid[store.pacman.x][store.pacman.y];
	if (cell.level !== 'NONE') {
	  store.pacman.totalPoints += cell.commitsCount;
	  store.pacman.points++;
	  store.config.pointsIncreasedCallback(store.pacman.totalPoints);
  
	  const theme = Utils.getCurrentTheme(store);
	  if (cell.level === 'FOURTH_QUARTILE') {
		console.log(`🔥 Power-up ativado na célula [${store.pacman.x}, ${store.pacman.y}] com nível ${cell.level}`);
		activatePowerUp(store);
	  }
  
	  // "Apaga" ponto da célula
	  cell.level = 'NONE';
	  cell.color = theme.intensityColors[0];
	  cell.commitsCount = 0;
	}
  };  

const activatePowerUp = (store: StoreType) => {
	store.pacman.powerupRemainingDuration = PACMAN_POWERUP_DURATION;
	store.ghosts.forEach((g) => (g.scared = true));
};

export const PacmanMovement = {
	movePacman
};