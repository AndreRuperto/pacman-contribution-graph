const core = require('@actions/core');
const PacmanRenderer = require('../../dist/pacman-contribution-graph.min.js');

async function run() {
  try {
    const username = core.getInput('github_user_name', { required: true });
    const token = core.getInput('github_token') || undefined;
    const theme = core.getInput('theme') || 'github-dark';

    console.log(`Iniciando com: ${username}, tema: ${theme}`);
    
    const renderer = new PacmanRenderer({
      platform: 'github',
      username,
      gameTheme: theme,
      githubSettings: { accessToken: token },
      outputFormat: 'svg',
      svgCallback: (svg) => {
        console.log('✅ SVG gerado com sucesso!');
        core.setOutput('svg', svg);
      },
      gameOverCallback: () => console.log('🎮 Jogo concluído.')
    });

    await renderer.start();
  } catch (err) {
    console.error('❌ Erro completo:', err);
    core.setFailed(err instanceof Error ? err.message : String(err));
  }
}

run();