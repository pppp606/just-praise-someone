import axios from 'axios';

export class GithubEventService {
  static async getUserPublicEvents(userId: string) {
    const token = process.env.GITHUB_ACCESS_TOKEN;
    const prePage = 50;

    const responses = await Promise.all(
      [1].map((page) =>
        axios.get(
          `https://api.github.com/users/${userId}/events/public?per_page=${prePage}&page=${page}`,
          {
            headers: {
              Accept: 'application/vnd.github+json',
              Authorization: `Bearer ${token}`,
              'X-GitHub-Api-Version': '2022-11-28',
            },
          }
        )
      )
    );

    const response = responses.reduce((acc, res) => {
      acc.data = acc.data.concat(res.data);
      return acc;
    });

    const events = response.data;

    const filteredEvents = events.map((event: any) => {
      const { type, repo, payload, created_at } = event;
      // WatchEvent,PushEventは無視
      if (
        type === 'WatchEvent' ||
        type === 'CreateEvent' ||
        type === 'DeleteEvent' ||
        type === 'ForkEvent'
      ) {
        return null;
      }

      const body =
        payload?.issue?.body ||
        payload?.pull_request?.body ||
        payload?.comment?.body;

      const trimBody = body
        ?.replace(/<[^>]+>/g, ' ')
        .replace(/https?:\/\/[^\s]+/g, '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/- \[.\] [^\n]*/g, '')
        .replace(
          /\b(##\s(Description|Status|Steps\sTo\sReproduce)|Fixes\s#\d+)\b[^\n]*/g,
          ''
        )
        .replace(/\d{4}-\d{2}-\d{2}/g, '')
        .replace(
          /diff --git[^\n]*\n.*\n?|\+{3}[^\n]*|\-{3}[^\n]*|\@\@[^\n]*\@\@/g,
          ''
        )
        .trim();

      const tmp = {
        type,
        repoName: repo?.name,
        // repoDescription: repo?.description,
        commits:
          payload?.commits?.map((commit: any) => ({
            message: commit.message,
          })) || [],
        title: payload?.issue?.title || payload?.pull_request?.title,
        body: trimBody,
        // createdAt: created_at,
      };

      if (tmp.commits.length === 0) {
        delete tmp.commits;
      }

      return tmp;
    });

    const user = await axios.get(`https://api.github.com/users/${userId}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    const filterUserDate = {
      name: user.data.name, // 名前
      company: user.data.company, // 所属会社
      location: user.data.location,
      bio: user.data.bio, // 自己紹介
      twitter_username: user.data.twitter_username, // Twitterユーザー名
      public_repos: user.data.public_repos, // 公開リポジトリ数
      followers: user.data.followers, // フォロワー数
      following: user.data.following, // フォロー数
      created_at: user.data.created_at, // アカウント作成日
      updated_at: user.data.updated_at, // アカウント更新日
    };

    return {
      user: filterUserDate,
      event: filteredEvents.filter((event: any) => event !== null),
    };
  }
}
