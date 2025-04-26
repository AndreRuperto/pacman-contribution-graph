// src/utils.ts
import { GAME_THEMES, GRID_HEIGHT, GRID_WIDTH } from './constants.js';
import { writeFileSync } from 'fs';
/* ─────────────────────────── Helpers ─────────────────────────── */
const weeksBetween = (start, end) => Math.floor((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
const truncateToUTCDate = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
/* ─────────────────────────── GitLab fetch ─────────────────────── */
const getGitlabContribution = async (store) => {
    const response = await fetch(`https://v0-new-project-q1hhrdodoye-abozanona-gmailcoms-projects.vercel.app/api/contributions?username=${store.config.username}`);
    const contributionsList = await response.json();
    return Object.entries(contributionsList).map(([date, count]) => ({
        date: new Date(date),
        count: Number(count),
        color: '#ebedf0',
        level: 'NONE'
    }));
};
/* ─────────────────────────── REST fetch ──────────────────────── */
const getGithubContribution = async (store) => {
    var _a, _b;
    const commits = [];
    let isComplete = false;
    let page = 1;
    do {
        try {
            const headers = {};
            if ((_a = store.config.githubSettings) === null || _a === void 0 ? void 0 : _a.accessToken) {
                headers['Authorization'] = 'Bearer ' + store.config.githubSettings.accessToken;
            }
            const response = await fetch(`https://api.github.com/search/commits?q=author:${store.config.username}&sort=author-date&order=desc&page=${page}&per_page=100`, { headers });
            const data = await response.json();
            isComplete = !data.items || data.items.length === 0;
            commits.push(...((_b = data.items) !== null && _b !== void 0 ? _b : []));
            page++;
        }
        catch (_c) {
            isComplete = true;
        }
    } while (!isComplete);
    return Array.from(commits
        .reduce((map, item) => {
        var _a, _b, _c, _d;
        const authorDateStr = (_b = (_a = item.commit.author) === null || _a === void 0 ? void 0 : _a.date) === null || _b === void 0 ? void 0 : _b.split('T')[0];
        const committerDateStr = (_d = (_c = item.commit.committer) === null || _c === void 0 ? void 0 : _c.date) === null || _d === void 0 ? void 0 : _d.split('T')[0];
        const keyDate = committerDateStr || authorDateStr;
        const count = (map.get(keyDate) || { count: 0 }).count + 1;
        return map.set(keyDate, {
            date: new Date(keyDate),
            count,
            color: '#ebedf0',
            level: 'NONE'
        });
    }, new Map())
        .values());
};
/* ───────────────────────── Tema e helpers ────────────────────── */
export const getCurrentTheme = (store) => { var _a; return (_a = GAME_THEMES[store.config.gameTheme]) !== null && _a !== void 0 ? _a : GAME_THEMES['github']; };
export const levelToIndex = (level) => {
    switch (level) {
        case 'NONE': return 0;
        case 'FIRST_QUARTILE': return 1;
        case 'SECOND_QUARTILE': return 2;
        case 'THIRD_QUARTILE': return 3;
        case 'FOURTH_QUARTILE': return 4;
        default: return 0;
    }
};
export const buildGrid = (store) => {
    const endDate = truncateToUTCDate(new Date());
    const startDate = new Date(endDate);
    startDate.setUTCDate(endDate.getUTCDate() - 365);
    startDate.setUTCDate(startDate.getUTCDate() - startDate.getUTCDay());
    const realWidth = 53;
    const grid = Array.from({ length: realWidth }, () => Array.from({ length: GRID_HEIGHT }, () => ({
        commitsCount: 0,
        color: getCurrentTheme(store).intensityColors[0],
        level: 'NONE'
    })));
    store.contributions.forEach((c) => {
        const date = truncateToUTCDate(new Date(c.date));
        if (date < startDate || date > endDate)
            return;
        const day = date.getUTCDay();
        const week = weeksBetween(startDate, date);
        if (week >= 0 && week < realWidth) {
            const theme = getCurrentTheme(store);
            grid[week][day] = {
                commitsCount: c.count,
                color: theme.intensityColors[levelToIndex(c.level)],
                level: c.level
            };
        }
    });
    store.grid = grid;
    const lastContributions = store.contributions;
    console.log('\n📆 Datas das últimas contribuições:');
    lastContributions.forEach(c => {
        console.log(`${c.date.toISOString().split('T')[0]} → ${c.level}, ${c.color}, ${c.count} commits`);
    });
    const preenchidas = grid.flat().filter(cell => cell.level !== 'NONE').length;
    console.log(`🟩 Células preenchidas: ${preenchidas}/${realWidth * GRID_HEIGHT}`);
};
export const buildMonthLabels = (store) => {
    const endDate = truncateToUTCDate(new Date());
    const startDate = new Date(endDate);
    startDate.setUTCDate(endDate.getUTCDate() - 365);
    startDate.setUTCDate(startDate.getUTCDate() - startDate.getUTCDay());
    const realWidth = weeksBetween(startDate, endDate) + 1;
    const labels = Array(realWidth).fill('');
    for (let week = 0; week < realWidth; week++) {
        const date = new Date(startDate);
        date.setUTCDate(startDate.getUTCDate() + week * 7);
        const month = date.toLocaleString('default', { month: 'short' });
        if (week === 0 || labels[week - 1] !== month)
            labels[week] = month;
    }
    store.monthLabels = realWidth > GRID_WIDTH
        ? labels.slice(realWidth - GRID_WIDTH)
        : labels;
};
export const createGridFromData = (store) => {
    buildGrid(store);
    printArena(store);
    return store.grid;
};
export const printArena = (store) => {
    console.log('\n🧱 Arena (via level + color) :\n');
    const levelSymbol = {
        NONE: '⬛',
        FIRST_QUARTILE: '🟩',
        SECOND_QUARTILE: '🟨',
        THIRD_QUARTILE: '🟧',
        FOURTH_QUARTILE: '🟥'
    };
    for (let y = 0; y < GRID_HEIGHT; y++) {
        const row = store.grid.map((col) => levelSymbol[col[y].level]).join('');
        console.log(row);
    }
};
export const printArenaAsHTML = (store) => {
    var _a, _b, _c, _d;
    const weeks = store.grid.length;
    const days = GRID_HEIGHT;
    const dates = store.contributions.map(c => c.date).sort((a, b) => a.getTime() - b.getTime());
    const firstDate = (_b = (_a = dates[0]) === null || _a === void 0 ? void 0 : _a.toISOString().split('T')[0]) !== null && _b !== void 0 ? _b : 'n/d';
    const lastDate = (_d = (_c = dates[dates.length - 1]) === null || _c === void 0 ? void 0 : _c.toISOString().split('T')[0]) !== null && _d !== void 0 ? _d : 'n/d';
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Arena Pac-Man</title>
  <style>
    body {
      background-color: #0d1117;
      font-family: monospace;
      color: white;
      padding: 20px;
    }
    .info {
      margin-bottom: 1rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(${weeks}, 14px);
      grid-template-rows: repeat(${days}, 14px);
      gap: 2px;
    }
    .cell {
      width: 14px;
      height: 14px;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <div class="info">
    <p><strong>🧱 Arena (via level + color)</strong></p>
    <p>🧾 Tamanho da arena: ${weeks} semanas × ${days} dias</p>
    <p>🗓️ Intervalo de datas: ${firstDate} → ${lastDate}</p>
  </div>
  <div class="grid">
    ${Array.from({ length: days }).map((_, day) => Array.from({ length: weeks }).map((_, week) => {
        const cell = store.grid[week][day];
        return `<div class="cell" style="background-color: ${cell.color};"></div>`;
    }).join('\n')).join('\n')}
  </div>
</body>
</html>
`;
    writeFileSync('arena.html', html, 'utf-8');
    console.log('📄 Arquivo "arena.html" gerado com sucesso!');
};
export const Utils = {
    getGitlabContribution,
    getGithubContribution,
    getCurrentTheme,
    buildGrid,
    buildMonthLabels,
    createGridFromData,
    printArena,
    levelToIndex,
    printArenaAsHTML
};
