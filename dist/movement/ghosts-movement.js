import { GRID_HEIGHT, GRID_WIDTH } from '../constants.js';
import { MovementUtils } from './movement-utils.js';
// Constantes para o comportamento dos fantasmas
const SCATTER_MODE_DURATION = 7; // Duração do modo "scatter" em segundos (frames)
const CHASE_MODE_DURATION = 20; // Duração do modo "chase" em segundos (frames)
const SCATTER_CORNERS = {
    'blinky': { x: GRID_WIDTH - 3, y: 0 }, // Canto superior direito
    'pinky': { x: 0, y: 0 }, // Canto superior esquerdo
    'inky': { x: GRID_WIDTH - 3, y: GRID_HEIGHT - 1 }, // Canto inferior direito
    'clyde': { x: 0, y: GRID_HEIGHT - 1 } // Canto inferior esquerdo
};
// Estado global dos modos de jogo
let currentMode = 'scatter';
let modeTimer = 0;
let currentLevel = 1;
let dotsRemaining = 0;
const moveGhosts = (store) => {
    // Calcular o número total de pontos restantes para definir o comportamento
    dotsRemaining = countRemainingDots(store);
    // Atualizar o modo de jogo (scatter ou chase)
    updateGameMode(store);
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
        // Lógica especial para fantasmas dentro da casa
        if (ghost.inHouse) {
            moveGhostInHouse(ghost, store);
            continue;
        }
        if (ghost.name === 'eyes') {
            ghost.scared = false;
        }
        if (ghost.immunityFrames !== undefined && ghost.immunityFrames > 0) {
            ghost.immunityFrames--;
            if (ghost.immunityFrames === 0) {
                ghost.scared = store.pacman.powerupRemainingDuration > 0;
                console.log(`Ghost ${ghost.name} immunity ended, scared: ${ghost.scared}`);
            }
        }
        // Lógica principal de movimento
        if (ghost.scared) {
            moveScaredGhost(ghost, store);
        }
        else if (ghost.name === 'eyes') {
            moveEyesToHome(ghost, store);
        }
        else {
            // Escolher o comportamento baseado no modo atual
            if (currentMode === 'scatter') {
                moveGhostToScatterTarget(ghost, store);
            }
            else {
                moveGhostWithPersonality(ghost, store);
            }
        }
    }
};
// Função para contar os pontos restantes no grid
const countRemainingDots = (store) => {
    let count = 0;
    for (let x = 0; x < GRID_WIDTH; x++) {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            if (store.grid[x][y].level !== 'NONE') {
                count++;
            }
        }
    }
    return count;
};
// Atualiza o modo de jogo entre "scatter" e "chase"
const updateGameMode = (store) => {
    // Se o Pac-Man está com power-up, não alterar o modo
    if (store.pacman.powerupRemainingDuration > 0)
        return;
    // Incrementar o timer do modo atual
    modeTimer++;
    // Verificar se é hora de mudar o modo
    const modeDuration = currentMode === 'scatter' ? SCATTER_MODE_DURATION : CHASE_MODE_DURATION;
    if (modeTimer >= modeDuration * (1000 / 200)) { // Convertendo para frames (assumindo 200ms por frame)
        // Alternar entre scatter e chase
        currentMode = currentMode === 'scatter' ? 'chase' : 'scatter';
        modeTimer = 0;
        // Reverter a direção dos fantasmas quando mudar o modo
        store.ghosts.forEach(ghost => {
            if (!ghost.inHouse && ghost.name !== 'eyes' && !ghost.scared) {
                reverseDirection(ghost);
            }
        });
    }
};
// Função para reverter a direção de um fantasma
const reverseDirection = (ghost) => {
    switch (ghost.direction) {
        case 'up':
            ghost.direction = 'down';
            break;
        case 'down':
            ghost.direction = 'up';
            break;
        case 'left':
            ghost.direction = 'right';
            break;
        case 'right':
            ghost.direction = 'left';
            break;
    }
};
const moveGhostInHouse = (ghost, store) => {
    // Se o fantasma estiver sendo liberado, permitir que ele saia da casa
    if (ghost.justReleasedFromHouse) {
        // O fantasma só pode sair pela porta, que está na posição x=26
        if (ghost.x === 26) {
            ghost.y = 2; // Posição da porta
            ghost.direction = 'up';
            ghost.inHouse = false;
            ghost.justReleasedFromHouse = false;
            console.log(`Ghost ${ghost.name} released from house`);
        }
        else {
            // Se não estiver na posição da porta, mover em direção a ela
            if (ghost.x < 26) {
                ghost.x += 1;
                ghost.direction = 'right';
            }
            else if (ghost.x > 26) {
                ghost.x -= 1;
                ghost.direction = 'left';
            }
        }
        return;
    }
    // Se o fantasma estiver em processo de respawn, só decrementar o contador
    if (ghost.respawnCounter && ghost.respawnCounter > 0) {
        ghost.respawnCounter--;
        // Quando o contador chegar a zero, restaurar o fantasma
        if (ghost.respawnCounter === 0) {
            if (ghost.originalName) {
                ghost.name = ghost.originalName;
                ghost.inHouse = false;
                ghost.scared = store.pacman.powerupRemainingDuration > 0;
                console.log(`Ghost respawned as ${ghost.name}`);
            }
        }
        return;
    }
    // Movimento vertical dentro da casa
    const topWall = 3; // A posição y=2 é onde fica a porta
    const bottomWall = 4;
    // Se estiver indo para cima e atingir o limite superior
    if (ghost.direction === 'up' && ghost.y <= topWall) {
        ghost.direction = 'down';
        ghost.y = topWall; // Garantir que não ultrapasse a parede
    }
    // Se estiver indo para baixo e atingir o limite inferior
    else if (ghost.direction === 'down' && ghost.y >= bottomWall - 1) {
        ghost.direction = 'up';
        ghost.y = bottomWall - 1; // Garantir que não ultrapasse a parede
    }
    // Aplicar o movimento na direção atual (movimento discreto em vez de fracionado)
    if (ghost.direction === 'up') {
        ghost.y -= 1; // Mover para cima em incrementos inteiros
    }
    else {
        ghost.y += 1; // Mover para baixo em incrementos inteiros
    }
    // Se o movimento resultou em uma posição inválida, reverter
    if (ghost.y < topWall || ghost.y >= bottomWall) {
        // Reverter para a posição anterior
        ghost.y = ghost.direction === 'up' ? topWall : bottomWall - 1;
        // Mudar direção
        ghost.direction = ghost.direction === 'up' ? 'down' : 'up';
    }
    console.log(`Ghost ${ghost.name} moving in house to ${ghost.x},${ghost.y} direction ${ghost.direction}`);
};
// Movimento para o modo "scatter" - cada fantasma vai para seu canto
const moveGhostToScatterTarget = (ghost, store) => {
    const target = SCATTER_CORNERS[ghost.name] || SCATTER_CORNERS['blinky'];
    ghost.target = target;
    const nextMove = BFSTargetLocation(ghost.x, ghost.y, target.x, target.y, ghost.direction);
    if (nextMove) {
        ghost.x = nextMove.x;
        ghost.y = nextMove.y;
        if (nextMove.direction) {
            ghost.direction = nextMove.direction;
        }
    }
};
// When scared, ghosts move randomly but with some intelligence
const moveScaredGhost = (ghost, store) => {
    // Verificar se já tem um alvo ou se já chegou no alvo atual
    if (!ghost.target || (ghost.x === ghost.target.x && ghost.y === ghost.target.y)) {
        ghost.target = getRandomDestination(ghost.x, ghost.y);
    }
    const validMoves = getValidMovesWithoutReverse(ghost);
    if (validMoves.length === 0)
        return;
    // Move toward target but with some randomness to appear "scared"
    const dx = ghost.target.x - ghost.x;
    const dy = ghost.target.y - ghost.y;
    // Filter moves that generally go toward the target but with randomness
    let possibleMoves = validMoves;
    // 50% de chance de escolher um movimento aleatório completamente
    if (Math.random() < 0.5) {
        // Escolhe qualquer movimento válido
    }
    else {
        // Tenta escolher um movimento que vá na direção do alvo
        const goodMoves = validMoves.filter((move) => {
            const moveX = move[0];
            const moveY = move[1];
            return (dx > 0 && moveX > 0) || (dx < 0 && moveX < 0) ||
                (dy > 0 && moveY > 0) || (dy < 0 && moveY < 0);
        });
        // Se houver movimentos "bons", use-os
        if (goodMoves.length > 0) {
            possibleMoves = goodMoves;
        }
    }
    // Choose a random move from the possible moves
    const [moveX, moveY] = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    // Se Pacman tem power-up, fantasmas se movem mais devagar (60% mais lentos)
    if (store.pacman.powerupRemainingDuration && Math.random() < 0.6)
        return;
    // Atualizar a direção do fantasma com base no movimento
    if (moveX > 0)
        ghost.direction = 'right';
    else if (moveX < 0)
        ghost.direction = 'left';
    else if (moveY > 0)
        ghost.direction = 'down';
    else if (moveY < 0)
        ghost.direction = 'up';
    ghost.x += moveX;
    ghost.y += moveY;
};
// Função para obter movimentos válidos que não sejam reversão da direção atual
const getValidMovesWithoutReverse = (ghost) => {
    const validMoves = MovementUtils.getValidMoves(ghost.x, ghost.y);
    // Não permitir que o fantasma reverta sua direção, exceto se for o único caminho
    return validMoves.filter(move => {
        const [dx, dy] = move;
        // Verifica se o movimento seria uma reversão da direção atual
        if ((ghost.direction === 'right' && dx < 0) ||
            (ghost.direction === 'left' && dx > 0) ||
            (ghost.direction === 'up' && dy > 0) ||
            (ghost.direction === 'down' && dy < 0)) {
            return false;
        }
        return true;
    });
};
// Movimento especial para olhos voltarem para casa
const moveEyesToHome = (ghost, store) => {
    const respawnPosition = { x: 26, y: 3 }; // Centro da casa dos fantasmas
    // Verificar se já está próximo/dentro da casa
    if (Math.abs(ghost.x - respawnPosition.x) <= 1 && Math.abs(ghost.y - respawnPosition.y) <= 1) {
        // Ajustar para a posição exata de respawn e iniciar o processo de respawn
        ghost.x = respawnPosition.x;
        ghost.y = respawnPosition.y;
        ghost.inHouse = true;
        ghost.respawnCounter = 1; // Tempo para respawnar
        console.log(`Ghost ${ghost.name} at eyes entered ghost house for respawn, counter: ${ghost.respawnCounter}`);
        return;
    }
    // Os olhos se movem mais rápido que os fantasmas normais
    const nextMove = MovementUtils.findNextStepDijkstra({ x: ghost.x, y: ghost.y }, respawnPosition);
    if (nextMove) {
        // Calcular a direção com base no movimento
        const dx = nextMove.x - ghost.x;
        const dy = nextMove.y - ghost.y;
        // Atualizar a direção baseada no movimento real
        if (dx > 0)
            ghost.direction = 'right';
        else if (dx < 0)
            ghost.direction = 'left';
        else if (dy > 0)
            ghost.direction = 'down';
        else if (dy < 0)
            ghost.direction = 'up';
        // Atualizar posição
        ghost.x = nextMove.x;
        ghost.y = nextMove.y;
        console.log(`Ghost eyes moved to (${ghost.x},${ghost.y}) direction ${ghost.direction}`);
    }
    else {
        // Se não conseguir encontrar um caminho, usar o BFSTargetLocation como fallback
        const alternativeMove = BFSTargetLocation(ghost.x, ghost.y, respawnPosition.x, respawnPosition.y, ghost.direction);
        if (alternativeMove) {
            ghost.x = alternativeMove.x;
            ghost.y = alternativeMove.y;
            if (alternativeMove.direction) {
                ghost.direction = alternativeMove.direction;
            }
            console.log(`Ghost eyes moved to (${ghost.x},${ghost.y}) using fallback method, direction ${ghost.direction}`);
        }
    }
};
// Movimento específico para cada personalidade de fantasma
const moveGhostWithPersonality = (ghost, store) => {
    // Se o fantasma estiver se respawnando (só olhos), usar lógica especializada
    if (ghost.name === 'eyes') {
        moveEyesToHome(ghost, store);
        return;
    }
    // Cálculo do alvo baseado na personalidade do fantasma
    const target = calculateGhostTarget(ghost, store);
    ghost.target = target;
    // Encontra o próximo movimento usando BFS, respeitando regras de não-reversão
    const nextMove = BFSTargetLocation(ghost.x, ghost.y, target.x, target.y, ghost.direction);
    if (nextMove) {
        ghost.x = nextMove.x;
        ghost.y = nextMove.y;
        if (nextMove.direction) {
            ghost.direction = nextMove.direction;
        }
    }
};
// Versão melhorada do BFS que respeita a regra de não-reversão
const BFSTargetLocation = (startX, startY, targetX, targetY, currentDirection) => {
    // Se já estamos no alvo, não precisa se mover
    if (startX === targetX && startY === targetY)
        return null;
    const queue = [
        { x: startX, y: startY, path: [], direction: currentDirection || 'right' }
    ];
    const visited = new Set();
    visited.add(`${startX},${startY}`);
    while (queue.length > 0) {
        const current = queue.shift();
        const { x, y, path, direction } = current;
        // Obter movimentos válidos
        const validMoves = MovementUtils.getValidMoves(x, y);
        // Filtrar movimentos que seriam reversão da direção atual
        const filteredMoves = validMoves.filter(move => {
            const [dx, dy] = move;
            // Se não temos direção definida, permitir qualquer movimento
            if (!direction)
                return true;
            // Verificar se seria uma reversão
            if ((direction === 'right' && dx < 0) ||
                (direction === 'left' && dx > 0) ||
                (direction === 'up' && dy > 0) ||
                (direction === 'down' && dy < 0)) {
                // Se só há um movimento válido e seria reversão, permitir mesmo assim
                return validMoves.length === 1;
            }
            return true;
        });
        for (const [dx, dy] of filteredMoves) {
            const newX = x + dx;
            const newY = y + dy;
            const key = `${newX},${newY}`;
            if (visited.has(key))
                continue;
            visited.add(key);
            // Determinar a nova direção
            let newDirection;
            if (dx > 0)
                newDirection = 'right';
            else if (dx < 0)
                newDirection = 'left';
            else if (dy > 0)
                newDirection = 'down';
            else if (dy < 0)
                newDirection = 'up';
            else
                newDirection = direction;
            const pathNode = {
                x: newX,
                y: newY,
                pathDirection: newDirection
            };
            const newPath = [...path, pathNode];
            if (newX === targetX && newY === targetY) {
                // Retornar a primeira posição do caminho com a direção
                return newPath.length > 0 ? {
                    x: newPath[0].x,
                    y: newPath[0].y,
                    direction: newPath[0].pathDirection
                } : null;
            }
            queue.push({ x: newX, y: newY, path: newPath, direction: newDirection });
        }
    }
    // Se não encontramos um caminho, verificar se há algum movimento válido
    const validMoves = MovementUtils.getValidMoves(startX, startY);
    if (validMoves.length > 0) {
        // Escolher um movimento aleatório se não encontrarmos caminho
        const [dx, dy] = validMoves[Math.floor(Math.random() * validMoves.length)];
        let direction = currentDirection;
        if (dx > 0)
            direction = 'right';
        else if (dx < 0)
            direction = 'left';
        else if (dy > 0)
            direction = 'down';
        else if (dy < 0)
            direction = 'up';
        return {
            x: startX + dx,
            y: startY + dy,
            direction
        };
    }
    // Se não há movimento válido, não se mover
    return null;
};
// Calcula o destino para cada fantasma baseado na sua personalidade
const calculateGhostTarget = (ghost, store) => {
    const { pacman } = store;
    let pacDirection = getPacmanDirection(store);
    // Ajuste a velocidade do Blinky com base nos pontos restantes (fica mais agressivo)
    let speedMultiplier = 1;
    if (ghost.name === 'blinky') {
        // Quando há poucos pontos restantes, Blinky fica mais rápido ("Elroy mode")
        const totalDots = GRID_WIDTH * GRID_HEIGHT;
        const dotsEaten = totalDots - dotsRemaining;
        const percentageEaten = dotsEaten / totalDots;
        if (percentageEaten > 0.7) {
            speedMultiplier = 1.2; // 20% mais rápido
        }
        if (percentageEaten > 0.9) {
            speedMultiplier = 1.4; // 40% mais rápido
        }
        // Aplicar o multiplicador de velocidade se estiver perseguindo o Pac-Man
        if (Math.random() < 0.8 * speedMultiplier) {
            // Blinky mira diretamente no Pac-Man
            return { x: pacman.x, y: pacman.y };
        }
    }
    switch (ghost.name) {
        case 'blinky': // Vermelho - mira diretamente no Pac-Man
            return { x: pacman.x, y: pacman.y };
        case 'pinky': // Rosa - tenta emboscar o Pac-Man se posicionando à sua frente
            const lookAhead = 4; // 4 células à frente do Pac-Man
            // Cálculo especial para o "bug" original: quando Pac-Man olha para cima,
            // o cálculo também adiciona 4 células para a esquerda
            let targetX = pacman.x;
            let targetY = pacman.y;
            if (pacman.direction === 'up') {
                // Reproduzindo o bug original
                targetX = pacman.x - 4;
                targetY = pacman.y - 4;
            }
            else {
                targetX = pacman.x + (pacDirection[0] * lookAhead);
                targetY = pacman.y + (pacDirection[1] * lookAhead);
            }
            // Garantir que o alvo esteja dentro do grid
            targetX = Math.min(Math.max(targetX, 0), GRID_WIDTH - 1);
            targetY = Math.min(Math.max(targetY, 0), GRID_HEIGHT - 1);
            return { x: targetX, y: targetY };
        case 'inky': // Azul - comportamento coordenado com Blinky
            const blinky = store.ghosts.find((g) => g.name === 'blinky');
            // Ponto de referência: 2 células à frente do Pac-Man
            let twoAhead = {
                x: pacman.x + (pacDirection[0] * 2),
                y: pacman.y + (pacDirection[1] * 2)
            };
            // Novamente, reproduzindo o bug do Pinky para cima
            if (pacman.direction === 'up') {
                twoAhead.x = pacman.x - 2;
                twoAhead.y = pacman.y - 2;
            }
            // Se Blinky existe, calcula o vetor a partir dele
            if (blinky) {
                // Dobra o vetor de Blinky até o ponto de referência
                const vectorX = twoAhead.x - blinky.x;
                const vectorY = twoAhead.y - blinky.y;
                twoAhead = {
                    x: twoAhead.x + vectorX,
                    y: twoAhead.y + vectorY
                };
            }
            // Garantir que o alvo esteja dentro do grid
            twoAhead.x = Math.min(Math.max(twoAhead.x, 0), GRID_WIDTH - 1);
            twoAhead.y = Math.min(Math.max(twoAhead.y, 0), GRID_HEIGHT - 1);
            return twoAhead;
        case 'clyde': // Laranja - alterna entre perseguir e ficar aleatório
            const distanceToPacman = MovementUtils.calculateDistance(ghost.x, ghost.y, pacman.x, pacman.y);
            // Comportamento especial de Clyde: se estiver muito perto, ele foge para seu canto
            if (distanceToPacman < 8) {
                return SCATTER_CORNERS['clyde']; // Vai para seu canto quando perto
            }
            else {
                // Quando longe, persegue o Pac-Man diretamente
                return { x: pacman.x, y: pacman.y };
            }
        default:
            // Comportamento padrão: mira no Pac-Man
            return { x: pacman.x, y: pacman.y };
    }
};
const getPacmanDirection = (store) => {
    switch (store.pacman.direction) {
        case 'right': return [1, 0];
        case 'left': return [-1, 0];
        case 'up': return [0, -1];
        case 'down': return [0, 1];
        default: return [0, 0];
    }
};
// Obter um destino aleatório para fantasmas assustados
const getRandomDestination = (x, y) => {
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
