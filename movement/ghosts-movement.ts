import { GRID_HEIGHT, GRID_WIDTH } from '../constants.js';
import { Ghost, Point2d, StoreType } from '../types.js';
import { MovementUtils } from './movement-utils.js';
import { determineGhostName } from '../game.js';

// Constante para controlar quantos frames os fantasmas ficam confusos ao sair da casa
const CONFUSION_FRAMES = 30;

function debugGhostState(store: StoreType) {
	console.group('🚀 Ghost States');
	
	store.ghosts.forEach((ghost, index) => {
	  // Verificação segura para evitar erros com propriedades indefinidas
	  const confusionFrames = ghost.confusionFrames || 0;
	  const justReleased = ghost.justReleasedFromHouse || false;
	  const respawnCounter = ghost.respawnCounter || 0;
	  
	  console.log(`Ghost #${index} (${ghost.name}):
		- Position: (${ghost.x}, ${ghost.y})
		- Direction: ${ghost.direction}
		- State: ${
			ghost.inHouse ? 'In House' :
			ghost.name === 'eyes' ? 'Eyes' :
			confusionFrames > 0 ? 'Confused' :
			ghost.scared ? 'Scared' : 'Normal'
		}
		- Details: ${
			ghost.inHouse ? `Staying in house` :
			ghost.name === 'eyes' ? `Returning to house` :
			confusionFrames > 0 ? `Confused for ${confusionFrames} more frames` :
			ghost.scared ? `Scared mode` : `Personality-based hunting`
		}
		- justReleasedFromHouse: ${justReleased ? 'YES' : 'NO'}
		- confusionFrames: ${confusionFrames}
		- respawnCounter: ${respawnCounter}
	  `);
	});
	
	console.groupEnd();
  }

const moveGhosts = (store: StoreType) => {
	// Depuração – primeiras 50 execuções
	//if (store.frameCount < 50) debugGhostState(store);

	// Cache para evitar spam de log
	store.__loggedGhosts = store.__loggedGhosts || new Set<string>();

	for (const ghost of store.ghosts) {
		/* ───────────── 0. fantasma ainda preso ───────────── */
		if (ghost.inHouse) continue;

		/* ───────────── 1. passeio inicial ───────────── */
		if ((ghost.initialWanderFrames ?? 0) > 0) {
			ghost.initialWanderFrames!--;

			// direção “desejada” (definida em placeGhosts)
			const dirMap: Record<'right'|'left'|'up'|'down',[number,number]> = {
				right:[ 1, 0], left:[-1, 0], up:[0,-1], down:[0, 1]
			};
			const wanted = dirMap[ghost.direction];
			const valid  = MovementUtils.getValidMoves(ghost.x, ghost.y);

			// mantém direção, mas se bloqueada escolhe aleatória
			const [dx,dy] =
				valid.find(([vx,vy]) => vx===wanted[0] && vy===wanted[1])
				?? valid[Math.floor(Math.random()*valid.length)];

			updateGhostDirection(ghost, dx, dy);
			ghost.x += dx;  ghost.y += dy;
			// não persegue enquanto ainda passeia
			continue;
		}

		/* ───────────── 2. estados existentes ───────────── */
		const confusionFrames = ghost.confusionFrames ?? 0;
		const justReleased    = ghost.justReleasedFromHouse ?? false;

		// ativa confusão ao sair da Ghost House
		if (justReleased && confusionFrames <= 0) {
			ghost.confusionFrames = CONFUSION_FRAMES;
			if (store.frameCount < 1)
				console.log(`Ghost ${ghost.name} is now confused for ${CONFUSION_FRAMES} frames`);
		}

		if (confusionFrames > 0) {
			// modo confuso
			ghost.confusionFrames = confusionFrames - 1;
			moveConfusedGhost(ghost, store);

			if ((ghost.confusionFrames ?? 0) <= 0) {
				ghost.justReleasedFromHouse = false;
				if (store.frameCount < 1)
					console.log(`Ghost ${ghost.name} confusion period ended, becoming smart now`);
			}
		}
		else if (ghost.scared && ghost.name !== 'eyes') {
			// modo assustado (velocidade reduzida e fuga)
			moveScaredGhost(ghost, store);
		}
		else if (ghost.name === 'eyes') {
			// olhos voltando para a casa
			moveEyesGhost(ghost, store);
		}
		else {
			// comportamento normal (personalidade)
			moveGhostWithPersonality(ghost, store);
		}

		/* ───────────── 3. log de movimentação ───────────── */
		if (store.frameCount < 50) {
			const key = `${ghost.name}:${ghost.x},${ghost.y}:${ghost.direction}`;
			if (!store.__loggedGhosts.has(key)) {
				console.log(
					`Ghost ${ghost.name} at (${ghost.x},${ghost.y}) moving ${ghost.direction}`
				);
				store.__loggedGhosts.add(key);
			}
		}
	}
};

// Movimento aleatório para fantasmas confusos que acabaram de sair da casa
const moveConfusedGhost = (ghost: Ghost, store: StoreType) => {
    const validMoves = MovementUtils.getValidMoves(ghost.x, ghost.y);
    if (validMoves.length === 0) return;

    // Escolher movimento aleatório
    const randomIndex = Math.floor(Math.random() * validMoves.length);
    const [moveX, moveY] = validMoves[randomIndex];

    // Atualizar direção e posição
    updateGhostDirection(ghost, moveX, moveY);
    ghost.x += moveX;
    ghost.y += moveY;

    if (store.frameCount < 50) {
    	console.log(`Confused ghost ${ghost.name} moved to (${ghost.x},${ghost.y}) direction ${ghost.direction}, ${ghost.confusionFrames} frames left`);
	}
};

// Movimento melhorado para fantasmas assustados
const moveScaredGhost = (ghost: Ghost, store: StoreType) => {
	// 50 % da velocidade
	if (store.frameCount % 2) return;

	const pac = store.pacman;
	const dx = ghost.x - pac.x, dy = ghost.y - pac.y;
	// alvo provisório 6 casas “para longe”
	const target = {
		x: Math.max(0, Math.min(GRID_WIDTH -1, ghost.x + Math.sign(dx)*6)),
		y: Math.max(0, Math.min(GRID_HEIGHT-1, ghost.y + Math.sign(dy)*6))
	};

	const next = MovementUtils.findNextStepDijkstra(
		{x:ghost.x,y:ghost.y}, target
	) ?? getRandomDestination(ghost.x,ghost.y);

	updateGhostDirection(ghost, next.x-ghost.x, next.y-ghost.y);
	ghost.x = next.x;  ghost.y = next.y;
};

// Movimento específico para olhos voltando para a casa de fantasmas
const moveEyesGhost = (ghost: Ghost, store: StoreType) => {
    const respawnPosition = { x: 26, y: 3 }; // Centro da casa dos fantasmas
    const target = calculateGhostTarget(ghost, store);
    ghost.target = target;
    
    // Mover direto para a posição de respawn usando BFS
    const nextMove = MovementUtils.findNextStepDijkstra(
		{x:ghost.x, y:ghost.y},
		{x:target.x, y:target.y}
	);
    
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
            
            // CORREÇÃO: Restaurar o fantasma original imediatamente
            ghost.name = ghost.originalName || determineGhostName(
                store.ghosts.findIndex(g => g === ghost)
            );
            
            console.log(`Ghost eyes arrived at home, transforming back to ${ghost.name}`);
        }
    }
};

const moveGhostWithPersonality = (ghost: Ghost, store: StoreType) => {
    // Código original para fantasmas normais
    const target = calculateGhostTarget(ghost, store);
    ghost.target = target;

    const nextMove =
	MovementUtils.findNextStepDijkstra(
		{x:ghost.x, y:ghost.y},
		{x:target.x, y:target.y}
	);

    if (nextMove) {
        ghost.x = nextMove.x;
        ghost.y = nextMove.y;
        
        if (nextMove.direction) {
            ghost.direction = nextMove.direction;
        }
    }
};

// Função auxiliar para atualizar a direção do fantasma
const updateGhostDirection = (ghost: Ghost, moveX: number, moveY: number) => {
    if (moveX > 0) ghost.direction = 'right';
    else if (moveX < 0) ghost.direction = 'left';
    else if (moveY > 0) ghost.direction = 'down';
    else if (moveY < 0) ghost.direction = 'up';
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

            // Determinar a direção com base na diferença de posição
            if (newX === targetX && newY === targetY) {
                // Se o caminho estiver vazio, calcular a direção diretamente
                if (path.length === 0) {
                    const direction = 
                        dx > 0 ? 'right' : 
                        dx < 0 ? 'left' : 
                        dy > 0 ? 'down' : 'up';
                    
                    return { x: newX, y: newY, direction };
                }
                
                // Caso contrário, retornar a primeira posição do caminho com a direção
                const firstStep = newPath[0];
                const firstDx = firstStep.x - startX;
                const firstDy = firstStep.y - startY;
                
                const direction = 
                    firstDx > 0 ? 'right' : 
                    firstDx < 0 ? 'left' : 
                    firstDy > 0 ? 'down' : 'up';
                
                return { 
                    x: firstStep.x, 
                    y: firstStep.y,
                    direction
                };
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