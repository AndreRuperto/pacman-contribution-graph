import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';
import { PacmanRenderer } from 'svg-pacman-contributions';

async function generateSvg(username, token, theme) {
  return new Promise((resolve) => {
    let lastMemoryUsage = 0;
    
    const config = {
      platform: 'github',
      username,
      gameTheme: theme,
      outputFormat: 'svg',
      gameSpeed: 1,
      githubSettings: { accessToken: token },
      svgCallback: (svg) => {
        console.log(`[SVG] Tamanho final do SVG: ${Math.round(svg.length / 1024)} KB`);
        resolve(svg);
      },
      gameOverCallback: () => {
        console.log(`🎮 Tema "${theme}" finalizado.`);
        // Mostrar uso final de memória
        const memoryUsage = process.memoryUsage();
        console.log(`[MEMORY] Uso final de memória: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`);
      },
    };

    console.log(`[INIT] Iniciando geração para usuário ${username}, tema ${theme}`);
    
    const renderer = new PacmanRenderer(config);
    renderer.start();
  });
}

async function run() {
  try {
    const username = core.getInput('github_user_name', { required: true });
    const token = core.getInput('github_token');
    const selectedTheme = core.getInput('theme') || 'github-dark';

    console.log(`[ACTION] Iniciando processo para usuário: ${username}`);
    console.log(`[ACTION] Tema selecionado: ${selectedTheme}`);
    
    const themes = ['github', 'github-dark'];
    const distPath = path.join(process.cwd(), 'dist');
    fs.mkdirSync(distPath, { recursive: true });

    for (const theme of themes) {
      console.log(`[ACTION] Gerando SVG para tema: ${theme}`);
      const startTime = Date.now();
      
      const svg = await generateSvg(username, token, theme);
      
      const executionTime = (Date.now() - startTime) / 1000;
      console.log(`[ACTION] Tema ${theme} gerado em ${executionTime.toFixed(2)}s`);
      
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
    console.error('[ERROR] Stack trace:', error.stack);
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}