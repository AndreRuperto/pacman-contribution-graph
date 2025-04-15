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

const generateAnimatedSVG = (store: StoreType) => {
	console.log("Verificando direções dos fantasmas ao longo do tempo:");
    store.gameHistory.slice(0, 20).forEach((state, index) => {
        console.log(`Frame ${index}:`, state.ghosts.map(g => `${g.name}:${g.direction}:${g.scared}`).join(', '));
    });
	console.log("Estado inicial dos fantasmas:", 
		store.ghosts.map(g => ({ 
		  name: g.name, 
		  x: g.x, 
		  y: g.y, 
		  direction: g.direction, 
		  inHouse: g.inHouse,
		  scared: g.scared
		}))
	  );
	  
	  console.log("Comprimento do histórico do jogo:", store.gameHistory.length);
	  
	  // Verificar os primeiros estados no histórico
	  if (store.gameHistory.length > 0) {
		console.log("Primeiro estado no histórico:", 
		  store.gameHistory[0].ghosts.map(g => ({ 
			name: g.name, 
			x: g.x, 
			y: g.y, 
			direction: g.direction
		  }))
		);
	  }
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
	console.log("Inicializando renderização de fantasmas");
    const uniqueGhostStates = new Set<string>();
	store.ghosts.forEach((ghost, index) => {
        console.log(`Ghost ${index} (${ghost.name}): x=${ghost.x}, y=${ghost.y}, direction=${ghost.direction}, scared=${ghost.scared}`);
        
        // Gere as posições dos fantasmas
        const ghostPositionAnimation = generateChangingValuesAnimation(store, generateGhostPositions(store, index));
        const stateKeyTimes: number[] = [];
        const stateValues: string[] = [];
        let lastState = '';
        
        store.gameHistory.forEach((state, frameIndex) => {
			if (index >= state.ghosts.length) return;
			const g = state.ghosts[index];
			
			// Atenção: Não remova o prefixo '#ghost-' aqui
			const currentState = g.scared 
				? 'scared' 
				: `${g.name}-${g.direction || 'right'}`;
			
			uniqueGhostStates.add(currentState);
			
			if (currentState !== lastState) {
				const keyTime = frameIndex / (store.gameHistory.length - 1);
				stateKeyTimes.push(keyTime);
				stateValues.push(currentState);
				lastState = currentState;
			}
		});
		
		// Garantir que haja um estado inicial
		if (stateKeyTimes.length === 0) {
			// Se não houver estados definidos, use o estado inicial do fantasma
			const initialState = ghost.scared 
				? 'scared' 
				: `${ghost.name}-${ghost.direction || 'right'}`;
			
			stateKeyTimes.push(0, 1);
			stateValues.push(initialState, initialState);
		}
		
		// Garantir que o último keyTime seja 1
		if (stateKeyTimes[stateKeyTimes.length - 1] !== 1) {
			stateKeyTimes.push(1);
			stateValues.push(lastState);
		}
        
        // Gere um grupo para este fantasma
        svg += `<g id="ghost${index}" transform="translate(0,0)">
            <animateTransform attributeName="transform" type="translate" 
                dur="${store.gameHistory.length * DELTA_TIME}ms" repeatCount="indefinite"
                keyTimes="${ghostPositionAnimation.keyTimes}"
                values="${ghostPositionAnimation.values}"
                additive="replace"/>`;
        
        // Adicione todos os estados possíveis para este fantasma
        const allPossibleStates = Array.from(uniqueGhostStates).filter(s => 
			s === 'scared' || 
			s.startsWith('eyes-') || // Ainda precisamos verificar "eyes-direction"
			s.startsWith(ghost.name) || // Estados do fantasma atual
			(ghost.originalName && s.startsWith(ghost.originalName)) // Estados do nome original (se existir)
		);
        
        allPossibleStates.forEach(state => {
			// Construir o href correto
			const href = state === 'scared' 
				? '#ghost-scared' 
				: `#ghost-${state}`;
			
			// Determinar quando este estado deve ser visível
			const visibilityKeyTimes: number[] = [];
			const visibilityValues: string[] = [];
			
			// CORREÇÃO IMPORTANTE: Verificar se este estado deve estar visível no início
			// Verificar se o primeiro estado na história do fantasma corresponde a este estado
			const initialState = stateValues.length > 0 ? stateValues[0] : null;
			const isInitialState = state === initialState;
			
			// Definir visibilidade inicial
			visibilityKeyTimes.push(0);
			visibilityValues.push(isInitialState ? 'visible' : 'hidden');
			
			// Definir as transições de visibilidade
			stateKeyTimes.forEach((keyTime, i) => {
				if (stateValues[i] === state) {
					// Se não for a primeira transição para este estado
					if (i > 0 || !isInitialState) {
						visibilityKeyTimes.push(keyTime);
						visibilityValues.push('visible');
					}
					
					// Se houver um próximo estado diferente
					if (i < stateValues.length - 1 && stateValues[i+1] !== state) {
						visibilityKeyTimes.push(stateKeyTimes[i+1] - 0.001);
						visibilityValues.push('visible');
						
						visibilityKeyTimes.push(stateKeyTimes[i+1]);
						visibilityValues.push('hidden');
					}
				}
			});
			
			// Se este é o último estado ativo, manter visível até o final
			if (stateValues.length > 0 && stateValues[stateValues.length - 1] === state) {
				if (visibilityKeyTimes[visibilityKeyTimes.length - 1] !== 1) {
					visibilityKeyTimes.push(1);
					visibilityValues.push('visible');
				}
			} else {
				// Caso contrário, garantir que termine invisível
				if (visibilityKeyTimes[visibilityKeyTimes.length - 1] !== 1) {
					visibilityKeyTimes.push(1);
					visibilityValues.push('hidden');
				}
			}
			
			// CORREÇÃO IMPORTANTE: Definir a visibilidade inicial corretamente
			const initialVisibility = isInitialState ? "visible" : "hidden";
			
			// Renderizar o elemento use com a configuração correta
			svg += `<use href="${href}" width="${CELL_SIZE}" height="${CELL_SIZE}" visibility="${initialVisibility}">
				<animate attributeName="visibility" 
					dur="${store.gameHistory.length * DELTA_TIME}ms" repeatCount="indefinite"
					keyTimes="${visibilityKeyTimes.join(';')}"
					values="${visibilityValues.join(';')}" />
			</use>`;

			// Adicionar um efeito de desvanecimento (fade) entre os estados para criar a ilusão de transição suave
			// svg += `<use href="${href}" width="${CELL_SIZE}" height="${CELL_SIZE}" visibility="hidden" opacity="0">
			// <animate attributeName="visibility" 
			// 	dur="${store.gameHistory.length * DELTA_TIME}ms" repeatCount="indefinite"
			// 	keyTimes="${visibilityKeyTimes.join(';')}"
			// 	values="${visibilityValues.join(';')}" />
			// <animate attributeName="opacity" 
			// 	dur="${store.gameHistory.length * DELTA_TIME}ms" repeatCount="indefinite"
			// 	keyTimes="${visibilityKeyTimes.join(';')}"
			// 	values="${visibilityKeyTimes.map(k => visibilityValues[visibilityKeyTimes.indexOf(k)] === 'visible' ? '1' : '0').join(';')}" />
			// </use>`;
		});
        // Feche o grupo
        svg += `</g>`;
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
        
        // Se o fantasma estiver em modo de olhos, use a sprite de olhos
        if (ghost.name === 'eyes') {
            return `#ghost-eyes-${ghost.direction || 'right'}`;
        }
        
        // Se o fantasma estiver assustado, use a sprite de assustado
        if (ghost.scared) {
            return '#ghost-scared';
        } 
        
        // Caso contrário, use a sprite correspondente à direção
        return `#ghost-${ghost.name}-${ghost.direction || 'right'}`;
    });
};

const generateGhostsPredefinition = () => {
	console.log("Símbolos de fantasmas definidos:", 
		['blinky', 'inky', 'pinky', 'clyde'].map(name => 
		  ['up', 'down', 'left', 'right'].map(dir => `ghost-${name}-${dir}`)
		).flat()
	  );
	  
	  console.log("Símbolos de olhos definidos:", 
		['up', 'down', 'left', 'right'].map(dir => `ghost-eyes-${dir}`)
	  );
    let defs = `<defs>`;
    
    // Para cada fantasma regular
    ['blinky', 'inky', 'pinky', 'clyde'].forEach(ghostName => {
        // Para cada direção
        ['up', 'down', 'left', 'right'].forEach(direction => {
            const ghostObj = GHOSTS[ghostName as GhostName] as Record<string, string>;
            
            if (direction in ghostObj) {
                defs += `
                <symbol id="ghost-${ghostName}-${direction}" viewBox="0 0 100 100">
                    <image href="${ghostObj[direction]}" width="100" height="100"/>
                </symbol>
                `;
            }
        });
    });
    
    // Adicionar o fantasma assustado
    defs += `
    <symbol id="ghost-scared" viewBox="0 0 100 100">
        <image href="${(GHOSTS['scared'] as { imgDate: string }).imgDate}" width="100" height="100"/>
    </symbol>`;
    
    // Adicionar os olhos do fantasma (para cada direção)
    ['up', 'down', 'left', 'right'].forEach(direction => {
        const eyesObj = GHOSTS['eyes'] as Record<string, string>;
        
        if (direction in eyesObj) {
            defs += `
            <symbol id="ghost-eyes-${direction}" viewBox="0 0 100 100">
                <image href="${eyesObj[direction]}" width="100" height="100"/>
            </symbol>
            `;
        }
    });
    
    defs += `</defs>`;
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