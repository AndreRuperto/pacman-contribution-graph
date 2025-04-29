import { GRID_HEIGHT, GRID_WIDTH, PACMAN_POWERUP_DURATION } from '../core/constants.js';
import { Point2d, StoreType } from '../types.js';
import { MovementUtils } from './movement-utils.js';
import { Utils } from '../utils/utils.js';

const RECENT_POSITIONS_LIMIT = 5;

enum PlayerStyle {
	CONSERVATIVE = 'conservador',
	AGGRESSIVE = 'agressivo',
	OPPORTUNISTIC = 'oportunista'
};

function logPacmanBehavior(
	dangerNearby: boolean,
	chosenPath: Point2d[],
	safetyScore: number,
	pointScore: number,
	playerStyle: PlayerStyle
  ) {
	// Como safetyScore é negativo (penalidade), precisamos inverter a comparação
	if (dangerNearby) {
	  if (Math.abs(safetyScore) > pointScore) {
		console.log('🟢 Pac-Man agiu como Conservador: fugiu do perigo');
	  } else {
		console.log('🔴 Pac-Man agiu como Agressivo: arriscou perto de fantasma!');
	  }
	} else {
	  if (pointScore > Math.abs(safetyScore) * 2) {
		console.log('🟠 Pac-Man agiu como Oportunista: buscou pontos em área segura');
	  } else if (Math.abs(safetyScore) > pointScore * 2) {
		console.log('🟢 Pac-Man agiu como Conservador: jogou com cautela mesmo sem perigo');
	  } else {
		console.log('🟠 Pac-Man equilibrando segurança e pontuação (comportamento padrão)');
	  }
	}
  };

  const movePacman = (store: StoreType) => {
    if (store.pacman.deadRemainingDuration) return;

    const hasPowerup = !!store.pacman.powerupRemainingDuration;
    const scaredGhosts = store.ghosts.filter((ghost) => ghost.scared);

    let targetPosition: Point2d;

    // Find a target position, ensuring it's never undefined
    try {
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

        // Safety check to ensure targetPosition is never undefined
        if (!targetPosition) {
            console.log('⚠️ No valid target found, using current position as target');
            targetPosition = { x: store.pacman.x, y: store.pacman.y };
        }

        const nextPosition = calculateOptimalPath(store, targetPosition);
        nextPosition ? updatePacmanPosition(store, nextPosition) : makeDesperationMove(store);

        checkAndEatPoint(store);
    } catch (error) {
        console.error('Error in movePacman:', error);
        // If all else fails, don't move
    }
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
    
    // Check if there are any cells with points left
    if (pointCells.length === 0) {
        // Return Pac-Man's current position as fallback
        return { x: store.pacman.x, y: store.pacman.y, value: 0 };
    }
    
    return pointCells[0];
};

const calculateOptimalPath = (store: StoreType, target: Point2d) => {
	const queue: { x: number; y: number; path: Point2d[]; score: number }[] = [
	  { x: store.pacman.x, y: store.pacman.y, path: [], score: 0 }
	];
	const visited = new Set<string>([`${store.pacman.x},${store.pacman.y}`]);
	const dangerMap = createDangerMap(store);
	
	// Obter o estilo do jogador e logar para debug
	const playerStyle = getPlayerStyle();
	// console.log(`🎮 Usando estilo: ${playerStyle}`); // Debug para confirmar o estilo
	const maxDangerValue = 15;
	
	// Definir os pesos de acordo com o estilo do jogador - valores mais extremos
	let safetyWeight = 0.5; // peso padrão para segurança
	let pointWeight = 0.5;  // peso padrão para pontos
	
	switch (playerStyle) {
	  case PlayerStyle.CONSERVATIVE:
		safetyWeight = 3.0; // Valores muito mais altos para garantir comportamento conservador
		pointWeight = 0.1;
		break;
	  case PlayerStyle.AGGRESSIVE:
		safetyWeight = 0.3;
		pointWeight = 2.0;
		break;
	  case PlayerStyle.OPPORTUNISTIC:
	  default:
		safetyWeight = 0.8;
		pointWeight = 0.8;
		break;
	}
	
	// Calcular a distância do fantasma mais próximo
	let closestGhostDistance = Infinity;
	store.ghosts.forEach((ghost) => {
	  if (!ghost.scared) {
		const dist = MovementUtils.calculateDistance(
		  store.pacman.x, store.pacman.y, ghost.x, ghost.y
		);
		closestGhostDistance = Math.min(closestGhostDistance, dist);
	  }
	});
	
	// Limiar de perigo mais restrito para conservador
	const dangerThreshold = playerStyle === PlayerStyle.CONSERVATIVE ? 5 : 7;
	const dangerNearby = closestGhostDistance < dangerThreshold;
	
	// Ajustar pesos ainda mais se houver perigo e for conservador
	if (playerStyle === PlayerStyle.CONSERVATIVE && dangerNearby) {
	  safetyWeight *= 5; // Aumentar drasticamente o peso de segurança em situações perigosas
	}
	
	while (queue.length > 0) {
	  queue.sort((a, b) => b.score - a.score);
	  const current = queue.shift()!;
	  const { x, y, path } = current;
	
	  if (x === target.x && y === target.y) {
		// Ao chegar no destino, analisar o comportamento
		if (path.length > 0) {
		  let totalSafetyScore = 0;
		  let totalPointScore = 0;
	
		  path.forEach((point) => {
			const key = `${point.x},${point.y}`;
			const danger = dangerMap.get(key) || 0;
			const points = store.grid[point.x][point.y].commitsCount;
	
			totalSafetyScore -= danger * safetyWeight;
			totalPointScore += points * pointWeight;
		  });
	
		//   logPacmanBehavior(
		// 	dangerNearby,
		// 	path,
		// 	totalSafetyScore,
		// 	totalPointScore,
		// 	playerStyle
		//   );
	
		  // Loga a cada 10 movimentos para não poluir o console
		  store.moveCounter = (store.moveCounter || 0) + 1;
		  if (store.moveCounter % 10 === 0) {
			// console.log(`🎮 Movimento #${store.moveCounter}: ${playerStyle} - ${path.length} passos`);
		  }
	
		  return path[0];
		}
		return null;
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
	
		  let safetyScore, pointScore, finalScore;
	
		  // Lógica de pontuação completamente invertida para estilo conservador
		  if (playerStyle === PlayerStyle.CONSERVATIVE) {
			// Para conservador: perigo é MUITO mais importante que pontos
			safetyScore = (maxDangerValue - danger) * safetyWeight;
			
			// Penalidades severas para células perigosas
			if (danger >= 5) {
			  safetyScore -= 100; // Penalidade severa para células perigosas
			} else {
			  // Bônus para células seguras
			  safetyScore += 50;
			}
			
			pointScore = pointValue * pointWeight;
			const distanceScore = -distanceToTarget / 10;
			
			// Componentes de score são diferentes para conservador
			finalScore = safetyScore * 5 + pointScore + distanceScore - revisitPenalty;
		  } else {
			// Lógica padrão para outros estilos
			safetyScore = (maxDangerValue - danger) * safetyWeight;
			pointScore = pointValue * pointWeight;
			const distanceScore = -distanceToTarget / 10;
			
			finalScore = safetyScore + pointScore + distanceScore - revisitPenalty;
		  }
		//   console.log(`DEBUG: Estilo=${playerStyle}, danger=${danger}, safetyScore=${safetyScore}, pointScore=${pointScore}, finalScore=${finalScore}`);
		  queue.push({
			x: newX,
			y: newY,
			path: newPath,
			score: finalScore
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
		// console.log(`🔥 Power-up ativado na célula [${store.pacman.x}, ${store.pacman.y}] com nível ${cell.level}`);
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

function getPlayerStyle(): PlayerStyle {
	const style = process.env.PLAYER_STYLE?.toLowerCase();
	const map: Record<string, PlayerStyle> = {
		conservador: PlayerStyle.CONSERVATIVE,
		agressivo: PlayerStyle.AGGRESSIVE,
		oportunista: PlayerStyle.OPPORTUNISTIC,
	};

	return map[style ?? ''] ?? PlayerStyle.OPPORTUNISTIC;
};

export const PacmanMovement = {
	movePacman
};