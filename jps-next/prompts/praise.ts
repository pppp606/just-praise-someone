interface GithubEvent {
  type: string;
  repoName: string;
  title?: string;
  body?: string;
  commits?: Array<{ message: string }>;
}

interface GithubUser {
  name: string;
  company?: string;
  location?: string;
  bio?: string;
  public_repos: number;
  followers: number;
  following: number;
}

interface TwitterUser {
  name: string;
  description?: string;
  metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
  };
}

interface Tweet {
  text: string;
  metrics: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
  };
}

interface PraiseResponse {
  body: string;
  skills: string[];
}

const AVAILABLE_SKILLS = [
  'コード品質',
  'デバッグスキル',
  'コードレビュー',
  'セキュリティ',
  'ハッキング',
  'スピード',
  '技術的専門知識',
  '技術トレンドのキャッチアップ',
  '学習意欲',
  '問題解決能力',
  'UIデザインセンス',
  '職場での適応性',
  '自走力',
  'ビジネスセンス',
  'リーダーシップ',
  'チームビルディング',
  'チームサポート',
  'コミュニケーションスキル',
  '柔軟性',
  'ドキュメントスキル',
];

export const generatePraisePrompt = (
  githubUser: GithubUser,
  githubEvents: GithubEvent[],
  twitterUser?: TwitterUser,
  tweets?: Tweet[]
): string => {
  const recentEvents = githubEvents.slice(0, 5); // 直近5件のイベント

  let twitterSection = '';
  if (twitterUser && tweets) {
    const recentTweets = tweets.slice(0, 3); // 直近3件のツイート

    twitterSection = `
Twitter情報:
- 名前: ${twitterUser.name}
- 自己紹介: ${twitterUser.description || '未設定'}
- フォロワー数: ${twitterUser.metrics.followers_count}
- フォロー数: ${twitterUser.metrics.following_count}
- ツイート数: ${twitterUser.metrics.tweet_count}

最近のツイート:
${recentTweets
  .map(
    (tweet) => `
- 内容: ${tweet.text}
- いいね数: ${tweet.metrics.like_count}
- リツイート数: ${tweet.metrics.retweet_count}
- 返信数: ${tweet.metrics.reply_count}
`
  )
  .join('\n')}`;
  }

  return `
以下のユーザーの情報と最近の活動を分析して、第三者がそのユーザーを紹介しながら称賛する形式のJSONを生成してください。

GitHub情報:
- 名前: ${githubUser.name}
- 所属: ${githubUser.company || '未設定'}
- 場所: ${githubUser.location || '未設定'}
- 自己紹介: ${githubUser.bio || '未設定'}
- 公開リポジトリ数: ${githubUser.public_repos}
- フォロワー数: ${githubUser.followers}
- フォロー数: ${githubUser.following}

最近のGitHub活動:
${recentEvents
  .map(
    (e) => `
- タイプ: ${e.type}
- リポジトリ: ${e.repoName}
${e.title ? `- タイトル: ${e.title}` : ''}
${e.body ? `- 内容: ${e.body}` : ''}
${
  e.commits
    ? `- コミット:
  ${e.commits.map((c) => `  - ${c.message}`).join('\n')}`
    : ''
}`
  )
  .join('\n')}${twitterSection}

以下のガイドラインに従ってJSONを生成してください：

1. 文章のトーンと内容
- 日本人が読む事を前提として日本語で出力
- 誰かが紹介しながら褒めている形式で、技術的な強みと成果を称賛
- 活動データから判明したスキルを魅力的に強調
- 褒められるユーザーが読んでいて嬉しいと感じる言葉で書く
- 特にユーザーの専門性を明らかにし、感情的にもポジティブな影響を与える表現を使用
- 文章内にユーザー名は利用しない
- 友達のようなトーンで書く
- すこし褒めすぎなぐらい褒める

2. スキルの選定
- GitHubの活動やツイートから、特に優れているスキルを3つ選び、skillsフィールドにリスト形式で記載
- 以下のスキルリストから選定：
${AVAILABLE_SKILLS.map((skill) => `- ${skill}`).join('\n')}

3. 出力JSON形式
{
  "body": "ユーザーを称賛する自由形式の文章。技術スキルを専門的に描写し、感情的なポジティブさを与える内容。",
  "skills": ["特に優れたスキルを3つ記載"]
}

注意事項：
- 約300文字程度の文章を生成
- 具体的な活動内容に言及
- 技術的な貢献やコミュニティへの参加を評価
- 温かみのある表現を使用
- 敬語を使用
- GitHubとTwitterの両方の活動を考慮（Twitter情報がある場合）
`;
}; 