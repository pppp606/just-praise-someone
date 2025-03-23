import { TwitterData } from '../../services/twitterService';

export const mockTwitterData: TwitterData = {
  user: {
    name: 'テストユーザー',
    username: 'testuser',
    description: 'テスト用のユーザーです',
    metrics: {
      followers_count: 100,
      following_count: 50,
      tweet_count: 200,
    },
  },
  tweets: [
    {
      id: '1',
      text: 'テストツイート1',
      created_at: '2024-03-20T10:00:00Z',
      metrics: {
        like_count: 10,
        retweet_count: 5,
        reply_count: 2,
      },
    },
    {
      id: '2',
      text: 'テストツイート2',
      created_at: '2024-03-19T15:30:00Z',
      metrics: {
        like_count: 15,
        retweet_count: 8,
        reply_count: 3,
      },
    },
  ],
}; 