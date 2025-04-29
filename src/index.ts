import { Game } from './core/game.js';
import { Grid } from './utils/grid.js';
import { Store } from './core/store.js';
import { Config, StoreType } from './types.js';
import { Utils } from './utils/utils.js';

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
      githubSettings: { accessToken: '' }
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

// Export default para compatibilidade com ES Modules
export default PacmanRenderer;

// Para compatibilidade com módulos CommonJS
if (typeof module !== 'undefined' && module.exports) {
  // Exportar como o valor padrão do módulo
  module.exports = PacmanRenderer;
  // Exportar como uma propriedade nomeada para desestruturação
  module.exports.PacmanRenderer = PacmanRenderer;
  // Exportar como propriedade default para interoperabilidade
  module.exports.default = PacmanRenderer;
}