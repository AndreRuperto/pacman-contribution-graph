// scripts/generate-svg.ts
import { mkdir, writeFile } from 'fs/promises';
import * as path from 'node:path';
import 'dotenv/config';

import { Store } from '../src/core/store.js';
import { Grid }  from '../src/utils/grid.js';
import { Game }  from '../src/core/game.js';
import { fetchGithubContributionsGraphQL } from '../src/providers/github-contributions.js';

import { GAME_THEMES } from '../src/core/constants.js';
import type { ThemeKeys } from '../src/types.js';

/* -------------------------------------------------------------------------- */
/* Tipagem da função pública                                                  */
/* -------------------------------------------------------------------------- */
export interface GenerateSvgOptions {
  /** Usuário do GitHub – **obrigatório** */
  username: string;
  /** Token pessoal (opcional) */
  token?: string;
  /** Tema de cores (default: `'github-dark'`) */
  theme?: ThemeKeys;
  /** Diretório de saída (default: `'dist'`) */
  outputDir?: string;
}

/* -------------------------------------------------------------------------- */
/* Função principal                                                           */
/* -------------------------------------------------------------------------- */
export async function generateSvg({
  username,
  token     = '',
  theme     = 'github-dark',
  outputDir = 'dist'
}: GenerateSvgOptions): Promise<void> {

  if (!username) {
    throw new Error('GITHUB_USERNAME não definido');
  }

  /* ── normaliza o tema ───────────────────────────────────────────── */
  const allowedThemes = Object.keys(GAME_THEMES) as ThemeKeys[];
  const safeTheme: ThemeKeys = allowedThemes.includes(theme) ? theme : 'github-dark';

  /* ── configura o Store ──────────────────────────────────────────── */
  Store.config = {
    platform: 'github',
    username,
    outputFormat: 'svg',
    gameSpeed: 1,
    gameTheme: safeTheme,
    enableSounds: false,
    canvas: {} as unknown as HTMLCanvasElement,   // não usado em SVG
    pointsIncreasedCallback: () => {},
    githubSettings: { accessToken: token },
    svgCallback: async (svg: string) => {
      await mkdir(outputDir, { recursive: true }).catch(() => {});
      const mainPath = path.join(outputDir, 'pacman-contribution-graph.svg');
      await writeFile(mainPath, svg, 'utf-8');

      // se for tema dark, gera arquivo alternativo
      if (safeTheme.includes('dark')) {
        const altPath = path.join(outputDir, 'pacman-contribution-graph-dark.svg');
        await writeFile(altPath, svg, 'utf-8');
      }
    },
    gameOverCallback: () => {}
  };

  /* ── pipeline ───────────────────────────────────────────────────── */
  Store.contributions = await fetchGithubContributionsGraphQL(
    Store,
    username,
    token
  );

  Grid.buildWalls();
  await Game.startGame(Store);      // o SVG é salvo via svgCallback
}