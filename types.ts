/* ───────────────────────── Tipos auxiliares ───────────────────────── */
export type Point2d = { 
  x: number; 
  y: number;
  direction?: 'right' | 'left' | 'up' | 'down';
};

/* ───────────────────────── Contribuições ──────────────────────────── */
export type ContributionLevel =
  | 'NONE'
  | 'FIRST_QUARTILE'
  | 'SECOND_QUARTILE'
  | 'THIRD_QUARTILE'
  | 'FOURTH_QUARTILE';

export interface Contribution {
  date: Date;
  count: number;
  color: string;              // cor hex que o GitHub devolve (tema claro)
  level: ContributionLevel;   // bucket calculado pelo GitHub
}

/* ───────────────────────── Pac‑Man & Fantasmas ────────────────────── */
export interface Pacman {
  x: number;
  y: number;
  direction: 'right' | 'left' | 'up' | 'down';
  points: number;
  totalPoints: number;
  deadRemainingDuration: number;
  powerupRemainingDuration: number;
  recentPositions: string[];
  target?: Point2d;
}

export type GhostName = 'blinky' | 'clyde' | 'inky' | 'pinky' | 'eyes';

export interface Ghost {
  x: number;
  y: number;
  name: GhostName;
  originalName?: GhostName;
  scared: boolean;
  direction: 'right' | 'left' | 'up' | 'down';
  target?: Point2d;
  inHouse?: boolean;
  isRespawning?: boolean;
  respawnCounter?: number;
}

/* ───────────────────────── Grid & Store ───────────────────────────── */
export interface GridCell {
  commitsCount: number;
  color: string;              // cor já pronta para render
  level: ContributionLevel;
}

export interface StoreType {
	frameCount: number;
	contributions: Contribution[];
	pacman: Pacman;
	ghosts: Ghost[];
	grid: GridCell[][];         // [week][day]
	monthLabels: string[];
	pacmanMouthOpen: boolean;
	gameInterval: number;
	gameHistory: {
	  pacman: Pacman;
	  ghosts: Ghost[];
	  grid: GridCell[][];
	}[];
	config: Config;
	useGithubThemeColor: boolean;
  __loggedGhosts?: Set<string>;
  }  

/* ───────────────────────── Configuração ───────────────────────────── */
export interface Config {
  platform: 'github' | 'gitlab';
  username: string;
  canvas: HTMLCanvasElement;
  outputFormat: 'canvas' | 'svg';
  svgCallback: (blobUrl: string) => void;
  gameOverCallback: () => void;
  gameTheme: ThemeKeys;
  gameSpeed: number;
  enableSounds: boolean;
  pointsIncreasedCallback: (pointsSum: number) => void;
  githubSettings?: {
    accessToken: string;      // necessário para GraphQL
  };
}

/* ───────────────────────── Temas ──────────────────────────────────── */
export type ThemeKeys = 'github' | 'github-dark' | 'gitlab' | 'gitlab-dark';

export interface GameTheme {
  textColor: string;
  gridBackground: string;
  wallColor: string;
  intensityColors: string[];  // 5 cores (NONE … FOURTH)
}

/* ───────────────────────── SVG Animation helper ──────────────────── */
export interface AnimationData {
  keyTimes: string;
  values: string;
}