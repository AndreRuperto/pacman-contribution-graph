import fetch from 'node-fetch';

type ContributionDay = {
  contributionCount: number;
  date: string;
};

type GraphQLResponse = {
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
};

export async function fetchGithubContributionsGraphQL(
  username: string,
  token: string
): Promise<{ date: Date; count: number }[]> { // <- 👈 mudou de string para Date
  const query = `
    query {
      user(login: "${username}") {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    throw new Error(`Erro ao buscar dados do GitHub: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as GraphQLResponse;

  const weeks = json.data.user.contributionsCollection.contributionCalendar.weeks;

  const contributions = weeks.flatMap((week) =>
    week.contributionDays.map((day) => ({
      date: new Date(day.date), // 👈 conversão importante
      count: day.contributionCount,
    }))
  );

  return contributions;
}