import { GameTheme, GhostName, ThemeKeys } from './types';

/* ───────────── Configurações gerais ───────────── */
export const CELL_SIZE  = 20;
export const GAP_SIZE   = 2;
export const GRID_WIDTH = 53;   // 52 semanas + semana corrente
export const GRID_HEIGHT = 7;   // dom … sáb

export const PACMAN_COLOR          = 'yellow';
export const PACMAN_COLOR_POWERUP  = 'red';
export const PACMAN_COLOR_DEAD     = '#80808064';

export const GHOST_NAMES: GhostName[] = ['blinky', 'clyde', 'inky', 'pinky'];

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const DELTA_TIME              = 200;
export const PACMAN_DEATH_DURATION   = 10;
export const PACMAN_POWERUP_DURATION = 15;

/* ───────────── Paletas GitHub oficiais ─────────────
   Array de 5 cores: índice 0 = NONE … 4 = FOURTH_QUARTILE             */
const GITHUB_LIGHT = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
const GITHUB_DARK  = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'/*'#FD0000'*/];

/* ───────────── Temas do jogo ───────────── */
export const GAME_THEMES: { [key in ThemeKeys]: GameTheme } = {
  /* ---------- GitHub ---------- */
  github: {
    textColor:      '#57606a',
    gridBackground: '#ffffff',
    wallColor:      '#000000',
    intensityColors: GITHUB_LIGHT
  },
  'github-dark': {
    textColor:      '#8b949e',
    gridBackground: '#0d1117',
    wallColor:      '#ffffff',
    intensityColors: GITHUB_DARK
  },

  /* ---------- GitLab (mantido) ---------- */
  gitlab: {
    textColor:      '#626167',
    gridBackground: '#ffffff',
    wallColor:      '#000000',
    intensityColors: GITHUB_LIGHT    // fallback
  },
  'gitlab-dark': {
    textColor:      '#999999',
    gridBackground: '#1f1f1f',
    wallColor:      '#ffffff',
    intensityColors: GITHUB_DARK     // fallback
  }
};

export const GHOSTS: {
	[key in GhostName | 'scared']: { [direction in 'up' | 'down' | 'left' | 'right']?: string } | { imgDate: string }
  } = {
	blinky: {
	  up: 'img/ghosts/red_up.png',
	  down: 'img/ghosts/red_down.png',
	  left: 'img/ghosts/red_left.png',
	  right: 'img/ghosts/red_right.png',
	},
	pinky: {
	  up: 'img/ghosts/pink_up.png',
	  down: 'img/ghosts/pink_down.png',
	  left: 'img/ghosts/pink_left.png',
	  right: 'img/ghosts/pink_right.png',
	},
	inky: {
	  up: 'img/ghosts/cyan_up.png',
	  down: 'img/ghosts/cyan_down.png',
	  left: 'img/ghosts/cyan_left.png',
	  right: 'img/ghosts/cyan_right.png',
	},
	clyde: {
	  up: 'img/ghosts/orange_up.png',
	  down: 'img/ghosts/orange_down.png',
	  left: 'img/ghosts/orange_left.png',
	  right: 'img/ghosts/orange_right.png',
	},
	scared: {
	  imgDate: 'img/ghosts/scared.png'
	}
  };  

export const WALLS: {
  horizontal: { active: boolean; id: string }[][];
  vertical:   { active: boolean; id: string }[][];
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
