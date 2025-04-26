import fetch from 'node-fetch';
import { ContributionLevel, Contribution, StoreType } from '../types.js';
import { getCurrentTheme, levelToIndex } from '../utils/utils.js'; // já está importado no seu projeto

/* ────────────────────────── Tipagens ────────────────────────── */
interface ContributionDay {
  date: string;
  contributionCount: number;
  color: string;
  contributionLevel: ContributionLevel;
}

interface GraphQLResponse {
  data: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          weeks: {
            contributionDays: ContributionDay[];
          }[];
        };
      };
    };
  };
}

/* ─────────────────────── Função principal ───────────────────── */
export async function fetchGithubContributionsGraphQL(
  store: StoreType,
  username: string,
  token: string
): Promise<Contribution[]> {

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
    throw new Error(
      `GitHub GraphQL request failed: ${response.status} ${response.statusText}`
    );
  }

  const json = (await response.json()) as GraphQLResponse;

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