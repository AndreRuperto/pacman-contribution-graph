import { GameTheme, GhostName, ThemeKeys } from './types';

export const CELL_SIZE = 20;
export const GAP_SIZE = 2;
export const GRID_WIDTH = 52;
export const GRID_HEIGHT = 7;
export const PACMAN_COLOR = 'yellow';
export const PACMAN_COLOR_POWERUP = 'red';
export const PACMAN_COLOR_DEAD = '#80808064';
export const GHOST_NAMES: GhostName[] = ['blinky', 'clyde', 'inky', 'pinky'];
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const DELTA_TIME = 200;
export const PACMAN_DEATH_DURATION = 10;
export const PACMAN_POWERUP_DURATION = 15;
export const GAME_THEMES: { [key in ThemeKeys]: GameTheme } = {
	github: {
		textColor: '#586069',
		gridBackground: '#ffffff',
		contributionBoxColor: '#9be9a8',
		emptyContributionBoxColor: '#ebedf0',
		wallColor: '#000000'
	},
	'github-dark': {
		textColor: '#8b949e',
		gridBackground: '#0d1117',
		contributionBoxColor: '#26a641',
		emptyContributionBoxColor: '#161b22',
		wallColor: '#FFFFFF'
	},
	gitlab: {
		textColor: '#626167',
		gridBackground: '#ffffff',
		contributionBoxColor: '#7992f5',
		emptyContributionBoxColor: '#ececef',
		wallColor: '#000000'
	},
	'gitlab-dark': {
		textColor: '#999999',
		gridBackground: '#1f1f1f',
		contributionBoxColor: '#2e7db1',
		emptyContributionBoxColor: '#2d2d2d',
		wallColor: '#FFFFFF'
	}
};
export const GHOSTS: { [key in GhostName | 'scared']: { imgDate: string } } = {
	blinky: {
		imgDate:
			'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAfUlEQVQ4T+2TUQ7AIAhDy/0PzQIRAqxmLtnn/DJPWypBAVkKKOMCyOQN7IRElLrcnIrDLNK4wVtxNbkb6Hq+jOcSbim6QVzKEstkw92gxVeFrMpqokix4wA+NvCOnvfArvcEbHoe2G9QmmhDMUc65p3xYC6q3zQPxtdl3NgF5QpL/b/rs3IAAAAASUVORK5CYIIA'
	},
	clyde: {
		imgDate:
			'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAgUlEQVQ4T+2T0Q6AIAhFLx9sH1MfTIPCAeLKrcd8PHqP4JBQLN7BFacNlHkAs+AQcqIueBs2mVWjgtWwl4yCdrd/pHYLLlVEgR2yK0wy4SoI5TcGXU4wM+AEJQfwsUCuXngDOR4rqKbngf0C94gyFHmkbd4rbkxD/pv2jfR1Ky7sBNrzXbHpnBX+AAAAAElFTkSuQmCC'
	},
	inky: {
		imgDate:
			'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAg0lEQVQ4T+WTWxKAIAhFuQvK/a+jFoT5QAVxypn+6vMEx6sDIO/jk12OAMs1WDVOXV3UBW+bRVbTFMFu8yCZBExH/g26VHCXI0AJpKgdUCUrTlkwxE+FECdzS7HiJemXgvyeO29gE7jD8wDVFX4vSLNtR1q2z+OVlaZxTaXYrq7HbxYBS8VgMVrqzkEAAAAASUVORK5CYIIA'
	},
	pinky: {
		imgDate:
			'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAhklEQVQ4T+2T0Q2AIAwF281wC50Qt9DNagoptqVESfyUz4N3vJCCECxaD4o47gt6bsAo2IWUqAnehkUmbYpgNqwlvSCnur+dtnnAuYUVyCGJimTAi8DUzwmwOoGI7hYjDgAfC/jqiTfg47ZBND0P7BeoR+Sh8CMt8x5xYSWkv2nbcF834swuA/9u49Yy5bgAAAAASUVORK5CYIIA'
	},
	scared: {
		imgDate:
			'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAeUlEQVQ4T82TUQ6AMAhD7UX0/sdyF0GREVmDmTN+bH9r6Bs0A0t2VpFULwDrrfBkZFcA3YC3ZodViAFGzQHyP0B2w2NrB0/1AoDbHwLoQ5/nrw1OBuD5e/crbM9Aiz35njHWzpSB/m3+0r40mV41M8U19WJe3Uw/tQOKt08pUUbBEQAAAABJRU5ErkJgggAA'
	}
};
export const WALLS: {
	horizontal: { active: boolean; id: string }[][];
	vertical: { active: boolean; id: string }[][];
} = {
	horizontal: Array(GRID_WIDTH + 1)
		.fill(null)
		.map(() => Array(GRID_HEIGHT + 1).fill({ active: false, id: '' })),
	vertical: Array(GRID_WIDTH + 1)
		.fill(null)
		.map(() => Array(GRID_HEIGHT + 1).fill({ active: false, id: '' }))
};

export const setWall = (x: number, y: number, direction: 'horizontal' | 'vertical', lineId: string) => {
	if (direction === 'horizontal') {
		if (x >= 0 && x < WALLS.horizontal.length && y >= 0 && y < WALLS.horizontal[0].length) {
			WALLS.horizontal[x][y] = { active: true, id: lineId };
		}
	} else {
		if (x >= 0 && x < WALLS.vertical.length && y >= 0 && y < WALLS.vertical[0].length) {
			WALLS.vertical[x][y] = { active: true, id: lineId };
		}
	}
};

export const hasWall = (x: number, y: number, direction: 'up' | 'down' | 'left' | 'right'): boolean => {
	switch (direction) {
		case 'up':
			return WALLS.horizontal[x][y].active;
		case 'down':
			return WALLS.horizontal[x + 1][y].active;
		case 'left':
			return WALLS.vertical[x][y].active;
		case 'right':
			return WALLS.vertical[x][y + 1].active;
	}
};
