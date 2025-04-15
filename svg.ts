import {
	CELL_SIZE,
	DELTA_TIME,
	GAP_SIZE,
	GHOSTS,
	GRID_HEIGHT,
	GRID_WIDTH,
	PACMAN_COLOR,
	PACMAN_COLOR_DEAD,
	PACMAN_COLOR_POWERUP,
	WALLS
} from './constants.js';
import { AnimationData, GhostName, StoreType } from './types.js';
import { Utils } from './utils.js';

const initialPositions = [
	{x: 23, y: 3}, // blinky
	{x: 24, y: 3}, // inky
	{x: 27, y: 3}, // pinky
	{x: 28, y: 3}  // clyde
  ];

const generateAnimatedSVG = (store: StoreType) => {
	const svgWidth = GRID_WIDTH * (CELL_SIZE + GAP_SIZE);
	const svgHeight = GRID_HEIGHT * (CELL_SIZE + GAP_SIZE) + 20;
	let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
	svg += `<desc>Generated with https://github.com/abozanona/pacman-contribution-graph on ${new Date()}</desc>`;
	svg += `<rect width="100%" height="100%" fill="${Utils.getCurrentTheme(store).gridBackground}"/>`;

	svg += generateGhostsPredefinition();

	// Month labels
	let lastMonth = '';
	for (let y = 0; y < GRID_WIDTH; y++) {
		if (store.monthLabels[y] !== lastMonth) {
			const xPos = y * (CELL_SIZE + GAP_SIZE) + CELL_SIZE / 2;
			svg += `<text x="${xPos}" y="10" text-anchor="middle" font-size="10" fill="${Utils.getCurrentTheme(store).textColor}">${store.monthLabels[y]}</text>`;
			lastMonth = store.monthLabels[y];
		}
	}

	// Grid
	for (let x = 0; x < GRID_WIDTH; x++) {
		for (let y = 0; y < GRID_HEIGHT; y++) {
			const cellX = x * (CELL_SIZE + GAP_SIZE);
			const cellY = y * (CELL_SIZE + GAP_SIZE) + 15;
			const cellColorAnimation = generateChangingValuesAnimation(store, generateCellColorValues(store, x, y));
			svg += `<rect id="c-${x}-${y}" x="${cellX}" y="${cellY}" width="${CELL_SIZE}" height="${CELL_SIZE}" rx="5" fill="${Utils.getCurrentTheme(store).intensityColors[0]}">
                <animate attributeName="fill" dur="${store.gameHistory.length * DELTA_TIME}ms" repeatCount="indefinite" 
                    values="${cellColorAnimation.values}" 
                    keyTimes="${cellColorAnimation.keyTimes}"/>
            </rect>`;
		}
	}

	// Walls
	for (let x = 0; x < GRID_WIDTH; x++) {
		for (let y = 0; y < GRID_HEIGHT; y++) {
			if (WALLS.horizontal[x][y].active) {
				svg += `<rect id="wh-${x}-${y}" x="${x * (CELL_SIZE + GAP_SIZE) - GAP_SIZE}" y="${y * (CELL_SIZE + GAP_SIZE) - GAP_SIZE + 15}" width="${CELL_SIZE + GAP_SIZE}" height="${GAP_SIZE}" rx="5" fill="${Utils.getCurrentTheme(store).wallColor}"></rect>`;
			}
			if (WALLS.vertical[x][y].active) {
				svg += `<rect id="wv-${x}-${y}" x="${x * (CELL_SIZE + GAP_SIZE) - GAP_SIZE}" y="${y * (CELL_SIZE + GAP_SIZE) - GAP_SIZE + 15}" width="${GAP_SIZE}" height="${CELL_SIZE + GAP_SIZE}" rx="5" fill="${Utils.getCurrentTheme(store).wallColor}"></rect>`;
			}
		}
	}

	// Pacman
	const pacmanColorAnimation = generateChangingValuesAnimation(store, generatePacManColors(store));
	const pacmanPositionAnimation = generateChangingValuesAnimation(store, generatePacManPositions(store));
	const pacmanRotationAnimation = generateChangingValuesAnimation(store, generatePacManRotations(store));
	svg += `<path id="pacman" d="${generatePacManPath(0.55)}"
        >
		<animate attributeName="fill" dur="${store.gameHistory.length * DELTA_TIME}ms" repeatCount="indefinite"
            keyTimes="${pacmanColorAnimation.keyTimes}"
            values="${pacmanColorAnimation.values}"/>
        <animateTransform attributeName="transform" type="translate" dur="${store.gameHistory.length * DELTA_TIME}ms" repeatCount="indefinite"
            keyTimes="${pacmanPositionAnimation.keyTimes}"
            values="${pacmanPositionAnimation.values}"
            additive="sum"/>
        <animateTransform attributeName="transform" type="rotate" dur="${store.gameHistory.length * DELTA_TIME}ms" repeatCount="indefinite"
            keyTimes="${pacmanRotationAnimation.keyTimes}"
            values="${pacmanRotationAnimation.values}"
            additive="sum"/>
        <animate attributeName="d" dur="0.5s" repeatCount="indefinite"
            values="${generatePacManPath(0.55)};${generatePacManPath(0.05)};${generatePacManPath(0.55)}"/>
    </path>`;

	// Ghosts - MODIFICADO PARA INCLUIR POSIÇÃO INICIAL
	store.ghosts.forEach((ghost, index) => {
		console.log(`Ghost ${ghost.name} initial position: x=${ghost.x}, y=${ghost.y}`);
		const ghostPositionAnimation = generateChangingValuesAnimation(store, generateGhostPositions(store, index));
		const ghostColorAnimation = generateChangingValuesAnimation(store, generateGhostColors(store, index));
		
		const initialHref = ghost.scared 
			? '#ghost-scared' 
			: `#ghost-${ghost.name}-${ghost.direction || 'right'}`;
		
		svg += `<use id="ghost${index}" width="${CELL_SIZE}" height="${CELL_SIZE}" href="${initialHref}">
			<animateTransform attributeName="transform" type="translate" dur="${store.gameHistory.length * DELTA_TIME}ms" repeatCount="indefinite"
				keyTimes="${ghostPositionAnimation.keyTimes}"
				values="${ghostPositionAnimation.values}"
				additive="replace"/>
			<animate attributeName="href" dur="${store.gameHistory.length * DELTA_TIME}ms" repeatCount="indefinite"
				keyTimes="${ghostColorAnimation.keyTimes}"
				values="${ghostColorAnimation.values}"/>
		</use>`;
	});

	svg += '</svg>';
	return svg;
};

const generatePacManPath = (mouthAngle: number) => {
	const radius = CELL_SIZE / 2;
	const startAngle = mouthAngle;
	const endAngle = 2 * Math.PI - mouthAngle;

	return `M ${radius},${radius}
            L ${radius + radius * Math.cos(startAngle)},${radius + radius * Math.sin(startAngle)}
            A ${radius},${radius} 0 1,1 ${radius + radius * Math.cos(endAngle)},${radius + radius * Math.sin(endAngle)}
            Z`;
};

const generatePacManPositions = (store: StoreType): string[] => {
	return store.gameHistory.map((state) => {
		const x = state.pacman.x * (CELL_SIZE + GAP_SIZE);
		const y = state.pacman.y * (CELL_SIZE + GAP_SIZE) + 15;
		return `${x},${y}`;
	});
};

const generatePacManRotations = (store: StoreType): string[] => {
	const pivit = CELL_SIZE / 2;
	return store.gameHistory.map((state) => {
		switch (state.pacman.direction) {
			case 'right':
				return `0 ${pivit} ${pivit}`;
			case 'left':
				return `180 ${pivit} ${pivit}`;
			case 'up':
				return `270 ${pivit} ${pivit}`;
			case 'down':
				return `90 ${pivit} ${pivit}`;
			default:
				return `0 ${pivit} ${pivit}`;
		}
	});
};

const generatePacManColors = (store: StoreType): string[] => {
	return store.gameHistory.map((state) => {
		if (state.pacman.deadRemainingDuration) {
			return PACMAN_COLOR_DEAD;
		} else if (state.pacman.powerupRemainingDuration) {
			return PACMAN_COLOR_POWERUP;
		} else {
			return PACMAN_COLOR;
		}
	});
};

// Alterar esta função para usar a propriedade correta
const generateCellColorValues = (store: StoreType, x: number, y: number): string[] => {
	return store.gameHistory.map((state) => state.grid[x][y].color);
};

const generateGhostPositions = (store: StoreType, ghostIndex: number): string[] => {
	return store.gameHistory.map((state) => {
		if (ghostIndex >= state.ghosts.length) {
			return "0,0"; // Valor padrão para casos onde o fantasma não existe
		}
		const ghost = state.ghosts[ghostIndex];
		const x = ghost.x * (CELL_SIZE + GAP_SIZE);
		const y = ghost.y * (CELL_SIZE + GAP_SIZE) + 15;
		return `${x},${y}`;
	});
};

const generateGhostColors = (store: StoreType, ghostIndex: number): string[] => {
	return store.gameHistory.map((state) => {
	  if (ghostIndex >= state.ghosts.length) {
		return "#ghost-blinky-right"; // Valor padrão
	  }
	  
	  const ghost = state.ghosts[ghostIndex];
	  
	  // Se o fantasma estiver assustado, use a sprite de assustado
	  if (ghost.scared) {
		return '#ghost-scared';
	  } 
	  
	  // Caso contrário, use a sprite correspondente à direção
	  return `#ghost-${ghost.name}-${ghost.direction || 'right'}`;
	});
  };

// Função generateGhostsPredefinition adaptada para usar os caminhos do GHOSTS
const generateGhostsPredefinition = () => {
	let defs = `<defs>`;
	
	// Para cada fantasma
	['blinky', 'inky', 'pinky', 'clyde'].forEach(ghostName => {
	  // Para cada direção
	  ['up', 'down', 'left', 'right'].forEach(direction => {
		// Use um tipo mais específico e com asserção de tipo
		const ghostObj = GHOSTS[ghostName as GhostName] as Record<string, string>;
		
		// Verifique explicitamente se a direção existe
		if (direction in ghostObj) {
		  defs += `
			<symbol id="ghost-${ghostName}-${direction}" viewBox="0 0 100 100">
			  <image href="${ghostObj[direction]}" width="100" height="100"/>
			</symbol>
		  `;
		}
	  });
	});
	
	// Adicionar o fantasma assustado - use uma asserção de tipo mais específica
	defs += `
	  <symbol id="ghost-scared" viewBox="0 0 100 100">
		<image href="${(GHOSTS['scared'] as { imgDate: string }).imgDate}" width="100" height="100"/>
	  </symbol>
	</defs>`;
	
	return defs;
  };

const generateChangingValuesAnimation = (store: StoreType, changingValues: string[]): AnimationData => {
	if (store.gameHistory.length !== changingValues.length) {
		throw new Error('The length of changingValues must match the length of gameHistory');
	}

	const totalFrames = store.gameHistory.length;
	let keyTimes: number[] = [];
	let values: string[] = [];
	let lastValue: string | null = null;
	let lastIndex: number | null = null;

	changingValues.forEach((currentValue, index) => {
		if (currentValue !== lastValue) {
			if (lastValue !== null && lastIndex !== null && index - 1 !== lastIndex) {
				// Add a keyframe right before the value change
				keyTimes.push(Number(((index - 0.000001) / (totalFrames - 1)).toFixed(6)));
				values.push(lastValue);
			}
			// Add the new value keyframe
			keyTimes.push(Number((index / (totalFrames - 1)).toFixed(6)));
			values.push(currentValue);
			lastValue = currentValue;
			lastIndex = index;
		}
	});

	// Ensure the last frame is always included
	if (keyTimes[keyTimes.length - 1] !== 1) {
		keyTimes.push(1);
		values.push(lastValue!);
	}

	return {
		keyTimes: keyTimes.join(';'),
		values: values.join(';')
	};
};

export const SVG = {
	generateAnimatedSVG
};