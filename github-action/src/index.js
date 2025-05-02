import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';
import { PacmanRenderer } from 'svg-pacman-contributions';

async function generateSvg(username, token, theme) {
  return new Promise((resolve) => {
    const config = {
      platform: 'github',
      username,
      gameTheme: theme,
      outputFormat: 'svg',
      gameSpeed: 1,
      githubSettings: { accessToken: token },
      svgCallback: (svg) => resolve(svg),
    };

    const renderer = new PacmanRenderer(config);
    renderer.start();
  });
}

async function run() {
  try {
    const username = core.getInput('github_user_name', { required: true });
    const token = core.getInput('github_token');
    const selectedTheme = core.getInput('theme') || 'github-dark';
    const outputDir = core.getInput('output_directory') || 'dist';

    fs.mkdirSync(outputDir, { recursive: true });

    const themes = ['github', 'github-dark'];
    for (const theme of themes) {
      const svg = await generateSvg(username, token, theme);
      const fileName = `pacman-contribution-graph${theme === 'github-dark' ? '-dark' : ''}.svg`;
      const fullPath = path.join(outputDir, fileName);
      fs.writeFileSync(fullPath, svg);

      if (theme === selectedTheme) {
        core.setOutput('svg', svg);
      }
    }
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

run();