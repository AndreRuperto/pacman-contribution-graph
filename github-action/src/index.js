const core = require('@actions/core');
const fs = require('fs');
const path = require('path');
const { PacmanRenderer } = require('svg-pacman-contributions');

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
      gameOverCallback: () => console.log(`🎮 Tema "${theme}" finalizado.`),
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

    const themes = ['github', 'github-dark'];
    const distPath = path.join(process.cwd(), 'dist');
    fs.mkdirSync(distPath, { recursive: true });

    for (const theme of themes) {
      const svg = await generateSvg(username, token, theme);
      const fileName = `pacman-contribution-graph${theme === 'github-dark' ? '-dark' : ''}.svg`;
      const fullPath = path.join(distPath, fileName);

      fs.writeFileSync(fullPath, svg);
      console.log(`💾 SVG salvo: ${fileName}`);

      if (theme === selectedTheme) {
        core.setOutput('svg', svg);
      }
    }

    console.log('✅ Processamento concluído.');
  } catch (error) {
    console.error('❌ Erro ao executar:', error);
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

run();