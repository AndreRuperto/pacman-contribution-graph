const core = require('@actions/core');
const PacmanRenderer = require('../../dist/pacman-contribution-graph.min.js').default;

async function run() {
  try {
    const username = core.getInput('github_user_name', { required: true });
    const token = core.getInput('github_token') || undefined;
    const theme = core.getInput('theme') || 'github-dark';

    const renderer = new PacmanRenderer({
      platform: 'github',
      username,
      gameTheme: theme,
      githubSettings: { accessToken: token },
      outputFormat: 'svg',
      svgCallback: (svg) => {
        core.info('✅ SVG gerado com sucesso.');
        core.setOutput('svg', svg);
      }
    });

    await renderer.start();
  } catch (err) {
    core.setFailed(err instanceof Error ? err.message : String(err));
  }
}

run();