// index.ts
import { Game } from './game.js';
import { Grid } from './grid.js';
import { Store } from './store.js';
import { Config, StoreType } from './types.js';
import { Utils } from './utils.js';

export class PacmanRenderer {
	store: StoreType;
	conf: Config;

	constructor(conf: Config) {
		this.store = structuredClone(Store);
		this.conf = { ...conf };
		Grid.buildWalls();
	}

	public async start() {
		const defaultConfig: Config = {
			platform: 'github',
			username: '',
			canvas: undefined as unknown as HTMLCanvasElement,
			outputFormat: 'svg',
			svgCallback: (_: string) => {},
			gameOverCallback: () => () => {},
			gameTheme: 'github',
			gameSpeed: 1,
			enableSounds: false,
			pointsIncreasedCallback: (_: number) => {},
			githubSettings: { accessToken: '' } // caso necessário
		};

		this.store.config = { ...defaultConfig, ...this.conf };

		switch (this.store.config.platform) {
			case 'gitlab':
				this.store.contributions = await Utils.getGitlabContribution(this.store);
				break;

			case 'github':
				this.store.contributions = await Utils.getGithubContribution(this.store);
				break;
		}

		Game.startGame(this.store);
	}

	public stop() {
		Game.stopGame(this.store);
	}
}