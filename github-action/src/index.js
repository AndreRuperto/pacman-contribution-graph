const core = require('@actions/core');

// Importar o módulo e capturar possíveis erros
let PacmanRenderer;
try {
  // Tentar diferentes métodos de importação
  const modulo = require('../../dist/pacman-contribution-graph.min.js');
  
  // Registrar informações para depuração
  console.log('Tipo do módulo importado:', typeof modulo);
  console.log('Chaves disponíveis:', Object.keys(modulo));
  
  // Tentar acessar o construtor de diferentes maneiras
  if (typeof modulo === 'function') {
    // Se o próprio módulo for uma função, use-a
    PacmanRenderer = modulo;
  } else if (modulo.default && typeof modulo.default === 'function') {
    // Se o módulo tiver uma exportação padrão que é uma função
    PacmanRenderer = modulo.default;
  } else if (modulo.PacmanRenderer && typeof modulo.PacmanRenderer === 'function') {
    // Se o módulo exportar especificamente PacmanRenderer
    PacmanRenderer = modulo.PacmanRenderer;
  } else {
    // Se o módulo tiver apenas uma exportação e for uma função
    const chaves = Object.keys(modulo);
    if (chaves.length === 1 && typeof modulo[chaves[0]] === 'function') {
      PacmanRenderer = modulo[chaves[0]];
    }
  }
  
  console.log('PacmanRenderer encontrado:', Boolean(PacmanRenderer));
} catch (erro) {
  console.error('Erro ao importar o módulo:', erro);
  throw erro;
}

async function run() {
  try {
    if (!PacmanRenderer || typeof PacmanRenderer !== 'function') {
      throw new Error(`PacmanRenderer não é um construtor (tipo: ${typeof PacmanRenderer})`);
    }

    const username = core.getInput('github_user_name', { required: true });
    const token = core.getInput('github_token') || undefined;
    const theme = core.getInput('theme') || 'github-dark';
    
    console.log(`Criando renderer com username: ${username}, theme: ${theme}`);

    const renderer = new PacmanRenderer({
      platform: 'github',
      username,
      gameTheme: theme,
      githubSettings: { accessToken: token },
      outputFormat: 'svg',
      svgCallback: (svg) => {
        console.log('SVG gerado com comprimento:', svg.length);
        core.info('✅ SVG gerado com sucesso.');
        core.setOutput('svg', svg);
      },
      gameOverCallback: () => {
        console.log('Jogo concluído com sucesso!');
      }
    });

    console.log('Iniciando renderizador...');
    await renderer.start();
    console.log('Processo concluído!');
  } catch (err) {
    console.error('Erro completo:', err);
    core.setFailed(err instanceof Error ? err.message : String(err));
  }
}

run();