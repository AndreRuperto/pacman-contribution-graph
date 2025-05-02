const core = require('@actions/core');
const fs = require('fs');
const path = require('path');
const { PacmanRenderer } = require('../../src/index.ts');

async function generateSvg(username, token, theme) {
  return new Promise((resolve) => {
    let generatedSvg = '';

    const config = {
      platform: 'github',
      username,
      gameTheme: theme,
      outputFormat: 'svg',
      gameSpeed: 1,
      githubSettings: { accessToken: token },
      svgCallback: (svg) => {
        generatedSvg = svg; // armazena o SVG gerado
      },
      gameOverCallback: () => {
        console.log(`[✔️] gameOverCallback disparado para o tema: ${theme}`);
        resolve(generatedSvg); // só resolve quando a animação termina
      }
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

    const themes = ['github-dark', 'github'];
    for (const theme of themes) {
      console.log(`🟡 Gerando SVG para o tema: ${theme}`);
      const svg = await generateSvg(username, token, theme);
      const fileName = `pacman-contribution-graph${theme === 'github-dark' ? '-dark' : ''}.svg`;
      const fullPath = path.join(outputDir, fileName);
      fs.writeFileSync(fullPath, svg);
      console.log(`✅ SVG salvo em: ${fullPath}`);

      if (theme === selectedTheme) {
        core.setOutput('svg', svg);
      }
    }
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

run();