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
	// Reduzir logs para apenas informações essenciais
	if (store.frameCount < 10) {
		console.log("Estado inicial dos fantasmas:", 
			store.ghosts.map(g => ({ 
				name: g.name, 
				direction: g.direction, 
				scared: g.scared
			}))
		);
		console.log("Comprimento do histórico do jogo:", store.gameHistory.length);
	}
	
	// Dimensões e duração
	const svgWidth = GRID_WIDTH * (CELL_SIZE + GAP_SIZE);
	const svgHeight = GRID_HEIGHT * (CELL_SIZE + GAP_SIZE) + 30; // Altura extra para o contador de tempo
	const totalDurationMs = store.gameHistory.length * DELTA_TIME;
	const totalDurationSecs = totalDurationMs / 1000;
	const minutes = Math.floor(totalDurationSecs / 60);
	const seconds = Math.round(totalDurationSecs % 60);
	const totalDurationFormatted = `${minutes}m ${seconds}s`;
	
	// Estrutura básica do SVG
	let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
	svg += `<desc>Generated with pacman-contribution-graph on ${new Date()}</desc>`;
	svg += `<metadata>
		<info>
			<frames>${store.gameHistory.length}</frames>
			<frameRate>${1000 / DELTA_TIME}</frameRate>
			<durationMs>${totalDurationMs}</durationMs>
			<generatedOn>${new Date().toISOString()}</generatedOn>
		</info>
	</metadata>`;
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
				<animate attributeName="fill" dur="${totalDurationMs}ms" repeatCount="indefinite" 
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
	svg += `<path id="pacman" d="${generatePacManPath(0.55)}" fill="${PACMAN_COLOR}">
		<animate attributeName="fill" dur="${totalDurationMs}ms" repeatCount="indefinite"
			keyTimes="${pacmanColorAnimation.keyTimes}"
			values="${pacmanColorAnimation.values}"/>
		<animateTransform attributeName="transform" type="translate" dur="${totalDurationMs}ms" repeatCount="indefinite"
			keyTimes="${pacmanPositionAnimation.keyTimes}"
			values="${pacmanPositionAnimation.values}"
			additive="sum"/>
		<animateTransform attributeName="transform" type="rotate" dur="${totalDurationMs}ms" repeatCount="indefinite"
			keyTimes="${pacmanRotationAnimation.keyTimes}"
			values="${pacmanRotationAnimation.values}"
			additive="sum"/>
		<animate attributeName="d" dur="0.5s" repeatCount="indefinite"
			values="${generatePacManPath(0.55)};${generatePacManPath(0.05)};${generatePacManPath(0.55)}"/>
	</path>`;

	// Ghosts - processados com menos logging
	if (store.frameCount < 10) {
		console.log("Inicializando renderização de fantasmas");
	}
	
	// Processe cada fantasma separadamente
	store.ghosts.forEach((ghost, index) => {
		// Gere animação de posição para este fantasma
		const ghostPositionAnimation = generateChangingValuesAnimation(store, generateGhostPositions(store, index));
		
		// Crie um grupo para o fantasma
		svg += `<g id="ghost${index}" transform="translate(0,0)">
			<animateTransform attributeName="transform" type="translate" 
				dur="${totalDurationMs}ms" repeatCount="indefinite"
				keyTimes="${ghostPositionAnimation.keyTimes}"
				values="${ghostPositionAnimation.values}"
				additive="replace"/>`;
		
		// Mapeie todas as possíveis combinações de estado + direção para este fantasma
		const stateChanges = mapGhostStateChanges(store, index);
		
		// Para cada estado possível, crie um elemento <use> com animação de visibilidade
		for (const [state, keyframes] of Object.entries(stateChanges)) {
			// Ignore estados vazios
			if (keyframes.length === 0) continue;
			
			// Use o ID correto para referência (blinky-right, scared, etc)
			const href = `#ghost-${state}`;
			
			// Construa as strings para a animação
			const keyTimes = keyframes.map(kf => kf.time).join(';');
			const values = keyframes.map(kf => kf.visible ? 'visible' : 'hidden').join(';');
			
			// Visibilidade inicial
			const initialVisibility = keyframes[0].visible ? 'visible' : 'hidden';
			
			svg += `<use href="${href}" width="${CELL_SIZE}" height="${CELL_SIZE}" visibility="${initialVisibility}">
				<animate attributeName="visibility" 
					dur="${totalDurationMs}ms" repeatCount="indefinite"
					keyTimes="${keyTimes}"
					values="${values}" />
			</use>`;
			const generateAnimatedSVG = (store: StoreType) => {
	// Reduzir logs para apenas informações essenciais
	if (store.frameCount < 10) {
		console.log("Estado inicial dos fantasmas:", 
			store.ghosts.map(g => ({ 
				name: g.name, 
				direction: g.direction, 
				scared: g.scared
			}))
		);
		console.log("Comprimento do histórico do jogo:", store.gameHistory.length);
	}
	
	// Dimensões e duração
	const svgWidth = GRID_WIDTH * (CELL_SIZE + GAP_SIZE);
	const svgHeight = GRID_HEIGHT * (CELL_SIZE + GAP_SIZE) + 30; // Altura extra para o contador de tempo
	const totalDurationMs = store.gameHistory.length * DELTA_TIME;
	const totalDurationSecs = totalDurationMs / 1000;
	const minutes = Math.floor(totalDurationSecs / 60);
	const seconds = Math.round(totalDurationSecs % 60);
	const totalDurationFormatted = `${minutes}m ${seconds}s`;
	
	// Estrutura básica do SVG
	let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
	svg += `<desc>Generated with pacman-contribution-graph on ${new Date()}</desc>`;
	svg += `<metadata>
		<info>
			<frames>${store.gameHistory.length}</frames>
			<frameRate>${1000 / DELTA_TIME}</frameRate>
			<durationMs>${totalDurationMs}</durationMs>
			<generatedOn>${new Date().toISOString()}</generatedOn>
		</info>
	</metadata>`;
	svg += `<rect width="100%" height="100%" fill="${Utils.getCurrentTheme(store).gridBackground}"/>`;
	
	// Contador de duração
	svg += `<text x="10" y="${svgHeight - 5}" font-size="10" fill="${Utils.getCurrentTheme(store).textColor}">
		Total Duration: ${totalDurationFormatted} (${store.gameHistory.length} frames)
	</text>`;
	
	// Barra de progresso
	svg += `
	<rect id="progress-bar-bg" x="110" y="${svgHeight - 15}" width="${svgWidth - 120}" height="10" 
		fill="rgba(200,200,200,0.2)" rx="5" />
	<rect id="progress-bar-fill" x="110" y="${svgHeight - 15}" width="0" height="10" 
		fill="${PACMAN_COLOR}" rx="5">
		<animate attributeName="width" 
			values="0;${svgWidth - 120}" 
			dur="${totalDurationMs}ms" 
			repeatCount="indefinite" />
	</rect>`;
	
	// Definições de elementos (ghosts)
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
				<animate attributeName="fill" dur="${totalDurationMs}ms" repeatCount="indefinite" 
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
	svg += `<path id="pacman" d="${generatePacManPath(0.55)}" fill="${PACMAN_COLOR}">
		<animate attributeName="fill" dur="${totalDurationMs}ms" repeatCount="indefinite"
			keyTimes="${pacmanColorAnimation.keyTimes}"
			values="${pacmanColorAnimation.values}"/>
		<animateTransform attributeName="transform" type="translate" dur="${totalDurationMs}ms" repeatCount="indefinite"
			keyTimes="${pacmanPositionAnimation.keyTimes}"
			values="${pacmanPositionAnimation.values}"
			additive="sum"/>
		<animateTransform attributeName="transform" type="rotate" dur="${totalDurationMs}ms" repeatCount="indefinite"
			keyTimes="${pacmanRotationAnimation.keyTimes}"
			values="${pacmanRotationAnimation.values}"
			additive="sum"/>
		<animate attributeName="d" dur="0.5s" repeatCount="indefinite"
			values="${generatePacManPath(0.55)};${generatePacManPath(0.05)};${generatePacManPath(0.55)}"/>
	</path>`;

	// Ghosts - processados com menos logging
	if (store.frameCount < 10) {
		console.log("Inicializando renderização de fantasmas");
	}
	
	// Processe cada fantasma separadamente
	store.ghosts.forEach((ghost, index) => {
		// Gere animação de posição para este fantasma
		const ghostPositionAnimation = generateChangingValuesAnimation(store, generateGhostPositions(store, index));
		
		// Crie um grupo para o fantasma
		svg += `<g id="ghost${index}" transform="translate(0,0)">
			<animateTransform attributeName="transform" type="translate" 
				dur="${totalDurationMs}ms" repeatCount="indefinite"
				keyTimes="${ghostPositionAnimation.keyTimes}"
				values="${ghostPositionAnimation.values}"
				additive="replace"/>`;
		
		// Mapeie todas as possíveis combinações de estado + direção para este fantasma
		const stateChanges = mapGhostStateChanges(store, index);
		
		// Para cada estado possível, crie um elemento <use> com animação de visibilidade
		for (const [state, keyframes] of Object.entries(stateChanges)) {
			// Ignore estados vazios
			if (keyframes.length === 0) continue;
			
			// Use o ID correto para referência (blinky-right, scared, etc)
			const href = `#ghost-${state}`;
			
			// Construa as strings para a animação
			const keyTimes = keyframes.map(kf => kf.time).join(';');
			const values = keyframes.map(kf => kf.visible ? 'visible' : 'hidden').join(';');
			
			// Visibilidade inicial
			const initialVisibility = keyframes[0].visible ? 'visible' : 'hidden';
			
			svg += `<use href="${href}" width="${CELL_SIZE}" height="${CELL_SIZE}" visibility="${initialVisibility}">
				<animate attributeName="visibility" 
					dur="${totalDurationMs}ms" repeatCount="indefinite"
					keyTimes="${keyTimes}"
					values="${values}" />
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
		}
		
		// Feche o grupo do fantasma
		svg += `</g>`;
	});

	// Log de informações sobre duração
	console.log(`
============================
🕒 SVG ANIMATION DURATION:
   - ${minutes}m ${seconds}s (${totalDurationMs}ms)
   - ${store.gameHistory.length} frames @ ${DELTA_TIME}ms per frame
============================
`);
	
	svg += '</svg>';
	return svg;
};
		}
		
		// Feche o grupo do fantasma
		svg += `</g>`;
	});

	// Log de informações sobre duração
	console.log(`
============================
🕒 SVG ANIMATION DURATION:
   - ${minutes}m ${seconds}s (${totalDurationMs}ms)
   - ${store.gameHistory.length} frames @ ${DELTA_TIME}ms per frame
============================
`);
	
	svg += '</svg>';
	return svg;
};

// Função auxiliar para mapear todas as mudanças de estado dos fantasmas
function mapGhostStateChanges(store: StoreType, ghostIndex: number) {
    // Um mapa de estados para frames onde eles estão visíveis
    // Chave: "nome-direção" ou "scared" ou "eyes-direção"
    // Valor: array de {time: number, visible: boolean}
    const stateChanges: Record<string, {time: number, visible: boolean}[]> = {};
    
    // Inicializar estados possíveis para todos os fantasmas
    const allPossibleStates = [
        'blinky-up', 'blinky-down', 'blinky-left', 'blinky-right',
        'inky-up', 'inky-down', 'inky-left', 'inky-right',
        'pinky-up', 'pinky-down', 'pinky-left', 'pinky-right',
        'clyde-up', 'clyde-down', 'clyde-left', 'clyde-right',
        'eyes-up', 'eyes-down', 'eyes-left', 'eyes-right',
        'scared'
    ];
    
    // Inicializar todos os estados como ocultos
    allPossibleStates.forEach(state => {
        stateChanges[state] = [{ time: 0, visible: false }];
    });
    
    // Obter o fantasma inicial
    const initialGhost = store.ghosts[ghostIndex];
    if (!initialGhost) return stateChanges;
    
    // Definir o estado inicial corretamente
    const initialState = initialGhost.scared 
        ? 'scared' 
        : initialGhost.name === 'eyes' 
            ? `eyes-${initialGhost.direction || 'right'}` 
            : `${initialGhost.name}-${initialGhost.direction || 'right'}`;
    
    // Marcar esse estado como visível inicialmente
    stateChanges[initialState] = [{ time: 0, visible: true }];
    
    // Rastrear o último estado
    let lastState = initialState;
    
    // Processar cada frame do histórico do jogo
    store.gameHistory.forEach((state, frameIndex) => {
        // Se o fantasma não existe neste frame, pular
        if (ghostIndex >= state.ghosts.length) return;
        
        const ghost = state.ghosts[ghostIndex];
        const currentTime = frameIndex / (store.gameHistory.length - 1);
        
        // Determinar o estado atual
        const currentState = ghost.scared 
            ? 'scared' 
            : ghost.name === 'eyes' 
                ? `eyes-${ghost.direction || 'right'}` 
                : `${ghost.name}-${ghost.direction || 'right'}`;
        
        // Se o estado mudou
        if (currentState !== lastState) {
            // Ocultar o estado anterior
            stateChanges[lastState].push({ time: currentTime, visible: false });
            
            // Mostrar o novo estado
            if (!stateChanges[currentState]) {
                stateChanges[currentState] = [{ time: 0, visible: false }];
            }
            stateChanges[currentState].push({ time: currentTime, visible: true });
            
            // Atualizar o último estado
            lastState = currentState;
        }
    });
    
    // Garantir que o último estado continue visível até o final
    stateChanges[lastState].push({ time: 1, visible: true });
    
    // Garantir que todos os outros estados fiquem ocultos até o final
    Object.keys(stateChanges).forEach(state => {
        if (state !== lastState && stateChanges[state].length > 0) {
            const lastKeyframe = stateChanges[state][stateChanges[state].length - 1];
            if (lastKeyframe.time < 1) {
                stateChanges[state].push({ time: 1, visible: false });
            }
        }
    });
    
    return stateChanges;
}

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

const generateGhostsPredefinition = () => {
	console.log("Definindo símbolos dos fantasmas");
    let defs = `<defs>`;
    
    // Para cada fantasma regular
    ['blinky', 'inky', 'pinky', 'clyde'].forEach(ghostName => {
        // Para cada direção
        ['up', 'down', 'left', 'right'].forEach(direction => {
            const ghostObj = GHOSTS[ghostName as GhostName] as Record<string, string>;
            
            if (direction in ghostObj) {
                defs += `
                <symbol id="ghost-${ghostName}-${direction}" viewBox="0 0 ${CELL_SIZE} ${CELL_SIZE}">
                    <image href="${ghostObj[direction]}" width="${CELL_SIZE}" height="${CELL_SIZE}"/>
                </symbol>
                `;
            }
        });
    });
    
    // Adicionar o fantasma assustado
    defs += `
    <symbol id="ghost-scared" viewBox="0 0 ${CELL_SIZE} ${CELL_SIZE}">
        <image href="${(GHOSTS['scared'] as { imgDate: string }).imgDate}" width="${CELL_SIZE}" height="${CELL_SIZE}"/>
    </symbol>`;
    
    // Adicionar os olhos do fantasma (para cada direção)
    ['up', 'down', 'left', 'right'].forEach(direction => {
        if (GHOSTS['eyes'] && direction in (GHOSTS['eyes'] as Record<string, string>)) {
            const eyesObj = GHOSTS['eyes'] as Record<string, string>;
            defs += `
            <symbol id="ghost-eyes-${direction}" viewBox="0 0 ${CELL_SIZE} ${CELL_SIZE}">
                <image href="${eyesObj[direction]}" width="${CELL_SIZE}" height="${CELL_SIZE}"/>
            </symbol>
            `;
        } else {
            // Fallback caso a direção não esteja definida
            console.warn(`Imagem para eyes-${direction} não encontrada, usando placeholder`);
            defs += `
            <symbol id="ghost-eyes-${direction}" viewBox="0 0 ${CELL_SIZE} ${CELL_SIZE}">
                <circle cx="${CELL_SIZE/2}" cy="${CELL_SIZE/2}" r="${CELL_SIZE/3}" fill="white"/>
            </symbol>
            `;
        }
    });
    
    defs += `</defs>`;
    return defs;
};

const generateChangingValuesAnimation = (store: StoreType, changingValues: string[]): AnimationData => {
	if (store.gameHistory.length !== changingValues.length) {
		throw new Error(`A quantidade de valores (${changingValues.length}) não corresponde ao tamanho do histórico do jogo (${store.gameHistory.length})`);
	}

	const totalFrames = store.gameHistory.length;
	if (totalFrames === 0) {
	    return { keyTimes: "0;1", values: changingValues[0] || '#000;#000' };
	}
	
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
	if (keyTimes.length === 0 || keyTimes[keyTimes.length - 1] !== 1) {
	    // Se não houver keyframes, adicionar frame inicial e final
	    if (keyTimes.length === 0) {
	        keyTimes.push(0, 1);
	        values.push(changingValues[0] || '#000', changingValues[changingValues.length - 1] || '#000');
	    } else {
    		keyTimes.push(1);
    		values.push(lastValue || changingValues[changingValues.length - 1] || '#000');
    	}
	}

	return {
		keyTimes: keyTimes.join(';'),
		values: values.join(';')
	};
};

export const SVG = {
	generateAnimatedSVG
};