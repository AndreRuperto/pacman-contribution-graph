import { fetchGithubContributionsGraphQL } from '../github-contributions.js'; // ajuste o path
import { Store } from '../store.js'; // certifique-se de importar isso no topo
async function main() {
    const username = 'AndreRuperto';
    const accessToken = process.env.GITHUB_TOKEN; // coloque no .env ou exporte no shell
    const data = await fetchGithubContributionsGraphQL(Store, username, accessToken);
    // Mostra só as 10 primeiras linhas
    data.sort((a, b) => a.date.getTime() - b.date.getTime());
    // últimas 10 linhas
    const last10 = data.slice(-30);
    console.table(last10.map(({ date, count, level, color }) => ({
        date: date.toISOString().split('T')[0],
        count,
        level,
        color,
    })));
}
main().catch(console.error);
