import { GRID_HEIGHT, GRID_WIDTH } from '../constants.js';
import { Ghost, Point2d, StoreType } from '../types.js';
import { MovementUtils } from './movement-utils.js';
import { determineGhostName } from '../game.js'

const moveGhosts = (store: StoreType) => {
    // Log de diagnóstico para rastrear o movimento dos fantasmas
    store.ghosts.forEach((ghost, i) => {
        // Use uma estrutura de conjunto para evitar logs duplicados
        store.__loggedGhosts = store.__loggedGhosts || new Set();
        const key = `${ghost.name}:${ghost.x},${ghost.y}:${ghost.direction}`;
        if (!store.__loggedGhosts.has(key)) {
            console.log(`Ghost ${ghost.name} at (${ghost.x},${ghost.y}) moving ${ghost.direction}`);
            store.__loggedGhosts.add(key);
        }
    });

    for (const ghost of store.ghosts) {
        if (ghost.inHouse) continue; // 👈 ainda preso na ghost house

        if (ghost.scared || Math.random() < 0.15) {
            moveScaredGhost(ghost, store);
        } else {
            moveGhostWithPersonality(ghost, store);
        }
    }
};

// When scared, ghosts move randomly but with some intelligence
const moveScaredGhost = (ghost: Ghost, store: StoreType) => {
	if (!ghost.target || (ghost.x === ghost.target.x && ghost.y === ghost.target.y)) {
		ghost.target = getRandomDestination(ghost.x, ghost.y);
	}

	const validMoves = MovementUtils.getValidMoves(ghost.x, ghost.y);
	if (validMoves.length === 0) return;

	// Move toward target but with some randomness to appear "scared"
	const dx = ghost.target.x - ghost.x;
	const dy = ghost.target.y - ghost.y;

	// Filter moves that generally go toward the target
	let possibleMoves = validMoves.filter((move) => {
		const moveX = move[0];
		const moveY = move[1];
		return (dx > 0 && moveX > 0) || (dx < 0 && moveX < 0) || (dy > 0 && moveY > 0) || (dy < 0 && moveY < 0);
	});

	// If no valid moves toward target, use any valid move
	if (possibleMoves.length === 0) {
		possibleMoves = validMoves;
	}

	// Choose a random move from the possible moves
	const [moveX, moveY] = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

	// If Pacman has power-up, ghosts move slower
	if (store.pacman.powerupRemainingDuration && Math.random() < 0.5) return;

    // Atualizar a direção do fantasma com base no movimento
    if (moveX > 0) ghost.direction = 'right';
    else if (moveX < 0) ghost.direction = 'left';
    else if (moveY > 0) ghost.direction = 'down';
    else if (moveY < 0) ghost.direction = 'up';
    
    ghost.x += moveX;
    ghost.y += moveY;

	if (moveX !== 0 || moveY !== 0) {
		console.log(`Ghost ${ghost.name} moved to (${ghost.x},${ghost.y}) direction ${ghost.direction}`);
	};
};

const moveGhostWithPersonality = (ghost: Ghost, store: StoreType) => {
    // Se o fantasma está se respawnando (só olhos)
    if (ghost.name === 'eyes') {
        const respawnPosition = { x: 26, y: 3 }; // Centro da casa dos fantasmas
        
        // Mova mais rápido quando estiver em modo de olhos
        const nextMove = BFSTargetLocation(ghost.x, ghost.y, respawnPosition.x, respawnPosition.y);
        
        if (nextMove) {
            ghost.x = nextMove.x;
            ghost.y = nextMove.y;
            
            if (nextMove.direction) {
                ghost.direction = nextMove.direction;
            }
            
            // Verificar se chegou à posição de respawn
            if (ghost.x === respawnPosition.x && ghost.y === respawnPosition.y) {
                // Iniciar o contador de respawn
                ghost.respawnCounter = 30; // Aproximadamente 3 segundos a 10 frames por segundo
                ghost.inHouse = true;
            }
        }
        return;
    }
    
    // Se o fantasma está dentro da casa aguardando respawn
    if (ghost.respawnCounter !== undefined && ghost.respawnCounter > 0) {
        ghost.respawnCounter--;
        
        // Quando o contador chegar a zero, restaurar o fantasma
        if (ghost.respawnCounter === 0) {
            ghost.name = ghost.originalName || determineGhostName(
                store.ghosts.findIndex(g => g === ghost)
            );
            ghost.inHouse = false;
            delete ghost.respawnCounter;
        }
        return;
    }
    
    // Código original para fantasmas normais
    const target = calculateGhostTarget(ghost, store);
    ghost.target = target;

    const nextMove = BFSTargetLocation(ghost.x, ghost.y, target.x, target.y);
    if (nextMove) {
        ghost.x = nextMove.x;
        ghost.y = nextMove.y;
        
        if (nextMove.direction) {
            ghost.direction = nextMove.direction;
        }
    }
};

// Find the next position to move to using BFS
const BFSTargetLocation = (startX: number, startY: number, targetX: number, targetY: number): Point2d | null => {
	// If we're already at the target, no need to move
	if (startX === targetX && startY === targetY) return null;

	const queue: { x: number; y: number; path: Point2d[] }[] = [{ x: startX, y: startY, path: [] }];
	const visited = new Set<string>();
	visited.add(`${startX},${startY}`);

	while (queue.length > 0) {
		const current = queue.shift()!;
		const { x, y, path } = current;

		const validMoves = MovementUtils.getValidMoves(x, y);

		for (const [dx, dy] of validMoves) {
			const newX = x + dx;
			const newY = y + dy;
			const key = `${newX},${newY}`;

			if (visited.has(key)) continue;
			visited.add(key);

			const newPath = [...path, { x: newX, y: newY }];

			// No método BFSTargetLocation, quando um próximo movimento é encontrado:
			if (newX === targetX && newY === targetY) {
				// Determinar a direção com base na posição atual e na próxima posição
				const dx = newX - x;
				const dy = newY - y;
				
				// Use uma única abordagem para determinar a direção
				const direction: 'right' | 'left' | 'up' | 'down' = 
					dx > 0 ? 'right' : 
					dx < 0 ? 'left' : 
					dy > 0 ? 'down' : 
					dy < 0 ? 'up' : 'right'; // valor padrão
				
				// Retornar a primeira posição do caminho com a direção
				return newPath.length > 0 ? { 
					x: newPath[0].x, 
					y: newPath[0].y,
					direction: direction
				} : null;
			}

			queue.push({ x: newX, y: newY, path: newPath });
		}
	}

	// If no path found, no need to move
	return null;
};

// Calculate ghost target based on personality
const calculateGhostTarget = (ghost: Ghost, store: StoreType): Point2d => {
	const { pacman } = store;
	let pacDirection = [0, 0];
	switch (ghost.name) {
		case 'blinky': // Red ghost - directly targets Pacman
			return { x: pacman.x, y: pacman.y };

		case 'pinky': // Pink ghost - targets 4 spaces ahead of Pacman
			pacDirection = getPacmanDirection(store);

			const lookAhead = 4;
			let fourAhead = {
				x: pacman.x + pacDirection[0] * lookAhead,
				y: pacman.y + pacDirection[1] * lookAhead
			};

			fourAhead.x = Math.min(Math.max(fourAhead.x, 0), GRID_WIDTH - 1);
			fourAhead.y = Math.min(Math.max(fourAhead.y, 0), GRID_HEIGHT - 1);
			return fourAhead;

		case 'inky': // Blue ghost - complex targeting based on Blinky's position
			const blinky = store.ghosts.find((g) => g.name === 'blinky');
			pacDirection = getPacmanDirection(store);

			// Target is 2 spaces ahead of Pacman
			let twoAhead = {
				x: pacman.x + pacDirection[0] * 2,
				y: pacman.y + pacDirection[1] * 2
			};

			// Then double the vector from Blinky to that position
			if (blinky) {
				twoAhead = {
					x: twoAhead.x + (twoAhead.x - blinky.x),
					y: twoAhead.y + (twoAhead.y - blinky.y)
				};
			}
			twoAhead.x = Math.min(Math.max(twoAhead.x, 0), GRID_WIDTH - 1);
			twoAhead.y = Math.min(Math.max(twoAhead.y, 0), GRID_HEIGHT - 1);
			return twoAhead;

		case 'clyde': // Orange ghost - targets Pacman when far, runs away when close
			const distanceToPacman = MovementUtils.calculateDistance(ghost.x, ghost.y, pacman.x, pacman.y);
			if (distanceToPacman > 8) {
				return { x: pacman.x, y: pacman.y };
			} else {
				return { x: 0, y: GRID_HEIGHT - 1 };
			}

		default:
			// Default behavior targets Pacman directly
			return { x: pacman.x, y: pacman.y };
	}
};

const getPacmanDirection = (store: StoreType): [number, number] => {
	switch (store.pacman.direction) {
		case 'right':
			return [1, 0];
		case 'left':
			return [-1, 0];
		case 'up':
			return [0, -1];
		case 'down':
			return [0, 1];
		default:
			return [0, 0];
	}
};

// Get a random destination for scared ghosts
const getRandomDestination = (x: number, y: number) => {
	const maxDistance = 8;
	const randomX = x + Math.floor(Math.random() * (2 * maxDistance + 1)) - maxDistance;
	const randomY = y + Math.floor(Math.random() * (2 * maxDistance + 1)) - maxDistance;
	return {
		x: Math.max(0, Math.min(randomX, GRID_WIDTH - 1)),
		y: Math.max(0, Math.min(randomY, GRID_HEIGHT - 1))
	};
};

export const GhostsMovement = {
	moveGhosts
};
