export const mockGithubData = {
  user: {
    name: 'テストユーザー',
    login: 'testuser',
    twitter_username: 'testuser',
    company: 'テスト会社',
    location: '東京',
    bio: 'テスト用のユーザーです',
    public_repos: 50,
    followers: 100,
    following: 50,
  },
  event: [
    {
      type: 'PushEvent',
      repoName: 'test/repo',
      title: 'テストPR',
      body: 'テスト用のPRです',
      commits: [
        { message: 'テストコミット1' },
        { message: 'テストコミット2' },
      ],
    },
    {
      type: 'PullRequestEvent',
      repoName: 'test/repo',
      title: '機能追加',
      body: '新しい機能を追加しました',
    },
    {
      type: 'IssueEvent',
      repoName: 'test/repo',
      title: 'バグ修正',
      body: 'バグを修正しました',
    },
  ],
}; 