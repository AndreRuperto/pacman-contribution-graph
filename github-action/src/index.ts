// github-action/src/index.ts
import * as core from '@actions/core';
// @ts-ignore
import { PacmanRenderer } from '../../dist/pacman-contribution-graph.min.js';  // usa o seu motor

async function run() {
  try {
    const username = core.getInput('github_user_name', { required: true });
    const token    = core.getInput('github_token') || undefined;
    const theme    = core.getInput('theme') || 'github-dark';

    const renderer = new PacmanRenderer({
      platform: 'github',
      username,
      gameTheme: theme,
      githubSettings: { accessToken: token },
      outputFormat: 'svg',
      svgCallback: (svg: string) => {
        core.info('✅ SVG gerado com sucesso.');
        core.setOutput('svg', svg);  // OUTPUT para o workflow
      }
    });

    await renderer.start();
  } catch (err: any) {
    core.setFailed(err.message);
  }
}
run();