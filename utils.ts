// src/utils.ts
import { GAME_THEMES, GRID_HEIGHT, GRID_WIDTH } from './constants.js';
import type { StoreType, GameTheme,  ContributionLevel, Contribution} from './types.js';

/* ─────────────────────────── Helpers ─────────────────────────── */
const weeksBetween = (start: Date, end: Date) =>
  Math.ceil((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));

const truncateToUTCDate = (d: Date) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

/* ─────────────────────────── GitLab fetch ───────────────────────
   (caso ainda queira usar como fallback ou segundo modo)           */
const getGitlabContribution = async (store: StoreType) => {
  const response = await fetch(
    `https://v0-new-project-q1hhrdodoye-abozanona-gmailcoms-projects.vercel.app/api/contributions?username=${store.config.username}`
  );
  const contributionsList = await response.json();

  // Aqui não temos 'color' nem 'level', então damos fallback:
  return Object.entries(contributionsList).map(([date, count]) => ({
    date: new Date(date),
    count: Number(count),
    color: '#ebedf0',     // fallback clarinho (ou outro)
    level: 'NONE' as const
  }));
};

/* ─────────────────────────── REST fetch ────────────────────────
   (antigo - se quiser manter. Também não retorna cor/nível)      */
const getGithubContribution = async (store: StoreType): Promise<Contribution[]> => {
  const commits: any[] = [];
  let isComplete = false;
  let page = 1;

  do {
    try {
      const headers: HeadersInit = {};
      if (store.config.githubSettings?.accessToken) {
        headers['Authorization'] = 'Bearer ' + store.config.githubSettings.accessToken;
      }

      const response = await fetch(
        `https://api.github.com/search/commits?q=author:${store.config.username}&sort=author-date&order=desc&page=${page}&per_page=100`,
        { headers }
      );

      const data: { items?: any[] } = await response.json();
      isComplete = !data.items || data.items.length === 0;
      commits.push(...(data.items ?? []));
      page++;
    } catch {
      isComplete = true;
    }
  } while (!isComplete);

  // idem, não temos color/level
  return Array.from(
    commits
      .reduce((map: any, item: any) => {
        const authorDateStr = item.commit.author?.date?.split('T')[0];
        const committerDateStr = item.commit.committer?.date?.split('T')[0];
        const keyDate = committerDateStr || authorDateStr;
        const count = (map.get(keyDate) || { count: 0 }).count + 1;
        return map.set(keyDate, {
          date: new Date(keyDate),
          count,
          color: '#ebedf0',   // fallback
          level: 'NONE' as const
        });
      }, new Map())
      .values()
  );
};

/* ───────────────────────── Tema e helpers ────────────────────── */
export const getCurrentTheme = (store: StoreType): GameTheme =>
  GAME_THEMES[store.config.gameTheme] ?? GAME_THEMES['github'];

export const levelToIndex = (level: ContributionLevel): number => {
  switch (level) {
    case 'NONE': return 0;
    case 'FIRST_QUARTILE': return 1;
    case 'SECOND_QUARTILE': return 2;
    case 'THIRD_QUARTILE': return 3;
    case 'FOURTH_QUARTILE': return 4;
    default: return 0;
  }
};

export const buildGrid = (store: StoreType) => {
  const endDate = truncateToUTCDate(new Date());

  // Domingo de (hoje - 365)
  const startDate = new Date(endDate);
  startDate.setUTCDate(endDate.getUTCDate() - 365);
  startDate.setUTCDate(startDate.getUTCDate() - startDate.getUTCDay());

  const realWidth = weeksBetween(startDate, endDate) + 1;

  // Inicializa grid com valores padrão
  const grid = Array.from({ length: realWidth }, () =>
    Array.from({ length: GRID_HEIGHT }, () => ({
      commitsCount: 0,
      color: '#ebedf0',
      level: 'NONE' as ContributionLevel
    }))
  );

  // Preenche células com base nas contribuições
  store.contributions.forEach((c) => {
    const date = truncateToUTCDate(new Date(c.date));
    if (date < startDate || date > endDate) return;

    const day = date.getUTCDay(); // 0 a 6
    const week = weeksBetween(startDate, date); // já é 0-based

    // Proteção extra para garantir que grid[week] existe
    if (week >= 0 && week < realWidth) {
      grid[week][day] = {
        commitsCount: c.count,
        color: getCurrentTheme(store).intensityColors[levelToIndex(c.level)],
        level: c.level
      };
    }
  });

  // Mantém no máximo 52 colunas (1 ano + semana atual)
  store.grid = realWidth > GRID_WIDTH
    ? grid.slice(realWidth - GRID_WIDTH)
    : grid;
};

export const buildMonthLabels = (store: StoreType) => {
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
    if (week === 0 || labels[week - 1] !== month) labels[week] = month;
  }

  store.monthLabels = realWidth > GRID_WIDTH
    ? labels.slice(realWidth - GRID_WIDTH)
    : labels;
};

/* Se você usa createGridFromData no modo "SVG", pode reaproveitar buildGrid */
export const createGridFromData = (store: StoreType) => {
  buildGrid(store);  // reaproveitamos
  printArena(store);
  return store.grid;
};

export const printArena = (store: StoreType) => {
  console.log('\n🧱 Arena (via level + color) :\n');

  // se quiser mapear level -> símbolo:
  const levelSymbol = {
    NONE:           '⬛',
    FIRST_QUARTILE: '🟩',
    SECOND_QUARTILE:'🟨',
    THIRD_QUARTILE: '🟧',
    FOURTH_QUARTILE:'🟥'
  } as const;

  for (let y = 0; y < GRID_HEIGHT; y++) {
    const row = store.grid.map((col) => {
      return levelSymbol[col[y].level];
    }).join('');
    console.log(row);
  }
};

export const Utils = {
  getGitlabContribution,
  getGithubContribution,
  getCurrentTheme,
  buildGrid,
  buildMonthLabels,
  createGridFromData,
  printArena,
  levelToIndex
};