import { Game } from './core/game.js';
import { Grid } from './utils/grid.js';
import { Store } from './core/store.js';
import { Config, StoreType } from './types.js';
import { Utils } from './utils/utils.js';
import { fetchGithubContributionsGraphQL } from './providers/github-contributions.js';

export class PacmanRenderer {
  store: StoreType;
  conf: Config;

  constructor(conf: Config) {
    // Usa deepClone como no generate-svg
    this.store = JSON.parse(JSON.stringify(Store));
    this.conf = { ...conf };
    
    // Não chama Grid.buildWalls() aqui - será chamado no start()
  }

  public async start() {
    const defaultConfig: Config = {
      platform: 'github',
      username: '',
      canvas: undefined as unknown as HTMLCanvasElement,
      outputFormat: 'svg',
      svgCallback: (_: string) => {},
      gameOverCallback: () => {},
      gameTheme: 'github',
      gameSpeed: 1,
      enableSounds: false,
      pointsIncreasedCallback: (_: number) => {},
      githubSettings: { accessToken: '' },
      // Adicionar um valor máximo de frames para evitar problemas
      maxFrames: 1000,
      // Adicionar um valor máximo de histórico para gerenciamento de memória
      maxHistorySize: 2000
    };

    this.store.config = { ...defaultConfig, ...this.conf };

    // Obter contribuições com base na plataforma
    switch (this.store.config.platform) {
      case 'gitlab':
        this.store.contributions = await Utils.getGitlabContribution(this.store);
        break;
      case 'github':
        // Se tiver token e for GitHub, usar GraphQL que é mais eficiente
        if (this.store.config.githubSettings?.accessToken) {
          try {
            const username = this.store.config.username;
            const token = this.store.config.githubSettings.accessToken;
            this.store.contributions = await fetchGithubContributionsGraphQL(
              this.store, 
              username, 
              token
            );
            console.log(`Obtidas ${this.store.contributions.length} contribuições via GraphQL`);
          } catch (error) {
            console.warn('Erro ao buscar via GraphQL, usando método alternativo:', error);
            this.store.contributions = await Utils.getGithubContribution(this.store);
          }
        } else {
          this.store.contributions = await Utils.getGithubContribution(this.store);
        }
        break;
      default:
        throw new Error(`Plataforma não suportada: ${this.store.config.platform}`);
    }

    // Agora segue o mesmo fluxo do generate-svg
    Grid.buildWalls();
    Utils.buildGrid(this.store);
    Utils.buildMonthLabels(this.store);

    // Log do estado antes de iniciar o jogo
    console.log(`Construído grid de ${this.store.grid.length}x${this.store.grid[0].length}`);
    console.log(`Contribuições carregadas: ${this.store.contributions.length}`);

    // Inicia o jogo e aguarda sua conclusão
    await Game.startGame(this.store);
    return this.store;
  }

  public stop() {
    Game.stopGame(this.store);
  }
}