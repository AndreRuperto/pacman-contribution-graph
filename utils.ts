import { GAME_THEMES, GRID_HEIGHT, GRID_WIDTH } from './constants.js';
import type { Contribution, GameTheme, StoreType } from './types.js';

const getGitlabContribution = async (store: StoreType): Promise<Contribution[]> => {
	// const response = await fetch(`https://gitlab.com/users/${username}/calendar.json`);
	const response = await fetch(
		`https://v0-new-project-q1hhrdodoye-abozanona-gmailcoms-projects.vercel.app/api/contributions?username=${store.config.username}`
	);
	const contributionsList = await response.json();
	return Object.entries(contributionsList).map(([date, count]) => ({
		date: new Date(date),
		count: Number(count)
	}));
};

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

			console.log(`🔎 Buscando commits da página ${page}...`);

			const response = await fetch(
				`https://api.github.com/search/commits?q=author:${store.config.username}&sort=author-date&order=desc&page=${page}&per_page=100`,
				{ headers }
			);

			const data: { items?: any[] } = await response.json();
			console.log(`📦 Resultado da página ${page}: ${data.items?.length ?? 0} commits`);

			isComplete = !data.items || data.items.length === 0;
			commits.push(...(data.items ?? []));
			page++;
		} catch (ex) {
			console.error('❌ Erro ao buscar commits do GitHub:', ex);
			isComplete = true;
		}
	} while (!isComplete);

	console.log(`✅ Total de commits encontrados: ${commits.length}`);

	return Array.from(
		commits
			.reduce((map: any, item: any) => {
				const authorDateStr = item.commit.author?.date?.split('T')[0];
				const committerDateStr = item.commit.committer?.date?.split('T')[0];
		
				// 👀 Log detalhado pra análise
				console.log(`🔍 Commit encontrado:`);
				console.log(`📅 Author date: ${item.commit.author?.date}`);
				console.log(`📅 Committer date: ${item.commit.committer?.date}`);
				console.log(`🔤 Mensagem: ${item.commit.message}`);
				console.log(`📁 Repositório: ${item.repository?.full_name}`);
				console.log(`---`);
		
				const keyDate = committerDateStr || authorDateStr;
				const count = (map.get(keyDate) || { count: 0 }).count + 1;
		
				return map.set(keyDate, { date: new Date(keyDate), count });
			}, new Map())
			.values()
	);
};

const getCurrentTheme = (store: StoreType): GameTheme => {
	return GAME_THEMES[store.config.gameTheme] ?? GAME_THEMES['github'];
};

const hexToRGBA = (hex: string, alpha: number): string => {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const hexToHexAlpha = (hex: string, alpha: number): string => {
	hex = hex.replace(/^#/, '');
	if (hex.length === 3) {
		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	}
	const alphaHex = Math.round(alpha * 255)
		.toString(16)
		.padStart(2, '0');
	return `#${hex}${alphaHex}`;
};

const buildGrid = (store: StoreType) => {
	const grid = Array.from({ length: GRID_WIDTH }, () =>
		Array.from({ length: GRID_HEIGHT }, () => ({
			intensity: 0,
			commitsCount: 0
		}))
	);

	const truncateDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
	const now = truncateDate(new Date());
	const endDate = now;

	const startDate = new Date(endDate);
	startDate.setDate(startDate.getDate() - 364);
	startDate.setDate(startDate.getDate() - startDate.getDay());

	console.log(`🗕️ Data inicial (ajustada para domingo): ${startDate.toISOString().split('T')[0]}`);
	console.log(`🗕️ Data final (hoje): ${endDate.toISOString().split('T')[0]}`);

	store.contributions.forEach((contribution) => {
		const date = truncateDate(new Date(contribution.date));
		if (date < startDate || date > endDate) return;

		const shiftedDate = new Date(date);
		shiftedDate.setDate(shiftedDate.getDate() + 1); // ⚠️ CORREÇÃO: adianta 1 dia

		const day = shiftedDate.getDay();
		const week = getWeekOffset(startDate, shiftedDate);

		if (week >= GRID_WIDTH || day >= GRID_HEIGHT) {
			console.warn(`⚠️ Contribuição ignorada (fora dos limites): ${shiftedDate.toISOString().split('T')[0]} | Week: ${week} | Day: ${day}`);
			return;
		}

		const intensity = Math.min(1, contribution.count / 4);
		if (intensity === 1) {
			console.log(`🎯 Alta intensidade: ${shiftedDate.toISOString().split('T')[0]} | Count: ${contribution.count} | Week: ${week} | Day: ${day}`);
		}
		console.log(`🔵 Intensidade: ${shiftedDate.toISOString().split('T')[0]} | Count: ${contribution.count} | Week: ${week} | Day: ${day}`);

		grid[week][day] = {
			intensity,
			commitsCount: contribution.count
		};
	});

	store.grid = grid;
};

const getWeekOffset = (start: Date, date: Date): number => {
	const diff = date.getTime() - start.getTime();
	const oneWeek = 1000 * 60 * 60 * 24 * 7;
	return Math.floor(diff / oneWeek);
};

const buildMonthLabels = (store: StoreType) => {
	const labels = Array(GRID_WIDTH).fill('');
	const firstDayOfYear = new Date(new Date().getFullYear(), 0, 1);

	for (let week = 0; week < GRID_WIDTH; week++) {
		const date = new Date(firstDayOfYear);
		date.setDate(date.getDate() + week * 7);
		const month = date.toLocaleString('default', { month: 'short' });

		if (week === 0 || labels[week - 1] !== month) {
			labels[week] = month;
		}
	}

	store.monthLabels = labels;
};

export const createGridFromData = (contributions: Contribution[]): { intensity: number; commitsCount: number }[][] => {
	const grid = Array.from({ length: GRID_WIDTH }, () =>
		Array.from({ length: GRID_HEIGHT }, () => ({ intensity: 0, commitsCount: 0 }))
	);

	contributions.forEach(({ date, count }) => {
		const d = new Date(date);
		const day = d.getDay()

		// Começa no domingo mais próximo do início do período de 1 ano
		const endDate = new Date(); // hoje
		endDate.setHours(0, 0, 0, 0);

		const startDate = new Date(endDate);
		startDate.setDate(startDate.getDate() - 364);
		startDate.setDate(startDate.getDate() - startDate.getDay()); // força domingo

		const diff = d.getTime() - startDate.getTime();
		const week = Math.floor(diff / (7 * 24 * 60 * 60 * 1000));

		if (week >= 0 && week < GRID_WIDTH && day >= 0 && day < GRID_HEIGHT) {
			const intensity = Math.min(1, count / 4);
			grid[week][day] = { intensity, commitsCount: count };
		}
	});

	return grid;
};

export const Utils = {
	getGitlabContribution,
	getGithubContribution,
	getCurrentTheme,
	hexToRGBA,
	hexToHexAlpha,
	buildGrid,
	buildMonthLabels,
	createGridFromData
};
