import fetch from 'node-fetch';
import { getCurrentTheme } from './utils.js'; // já está importado no seu projeto
import { levelToIndex } from './utils.js'; // certifique-se que essa função está exportada
/* ─────────────────────── Função principal ───────────────────── */
export async function fetchGithubContributionsGraphQL(store, username, token) {
    const query = /* GraphQL */ `
    query ($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
                color
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;
    const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, variables: { login: username } })
    });
    if (!response.ok) {
        throw new Error(`GitHub GraphQL request failed: ${response.status} ${response.statusText}`);
    }
    const json = (await response.json());
    return json.data.user.contributionsCollection.contributionCalendar.weeks
        .flatMap((week) => week.contributionDays)
        .map((d) => {
        const level = d.contributionLevel;
        const theme = getCurrentTheme(store);
        return {
            date: new Date(d.date),
            count: d.contributionCount,
            color: theme.intensityColors[levelToIndex(level)],
            level
        };
    });
}
