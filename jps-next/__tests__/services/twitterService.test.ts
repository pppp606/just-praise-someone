import { TwitterService } from '../../services/twitterService';
import { mockTwitterData } from '../mocks/twitterData';
import { TwitterApi } from 'twitter-api-v2';

// TwitterApiのモック
jest.mock('twitter-api-v2', () => ({
  TwitterApi: jest.fn().mockImplementation(() => ({
    v2: {
      userByUsername: jest.fn().mockResolvedValue({
        data: {
          id: '123',
          name: mockTwitterData.user.name,
          username: mockTwitterData.user.username,
          description: mockTwitterData.user.description,
          public_metrics: mockTwitterData.user.metrics,
        },
      }),
      userTimeline: jest.fn().mockResolvedValue({
        data: {
          data: mockTwitterData.tweets.map(tweet => ({
            id: tweet.id,
            text: tweet.text,
            created_at: tweet.created_at,
            public_metrics: tweet.metrics,
          })),
        },
      }),
    },
  })),
}));

describe('TwitterService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserTweets', () => {
    it('ユーザー情報とツイートを正しく取得できること', async () => {
      const result = await TwitterService.getUserTweets('testuser');

      expect(result).toEqual(mockTwitterData);
      expect(TwitterApi).toHaveBeenCalledWith(process.env.TWITTER_BEARER_TOKEN);
    });

    it('ユーザーが見つからない場合エラーをスローすること', async () => {
      // ユーザーが見つからない場合のモック
      (TwitterApi as jest.Mock).mockImplementationOnce(() => ({
        v2: {
          userByUsername: jest.fn().mockResolvedValue({
            data: null,
          }),
        },
      }));

      await expect(TwitterService.getUserTweets('nonexistent')).rejects.toThrow(
        'User nonexistent not found'
      );
    });

    it('APIエラーが発生した場合エラーをスローすること', async () => {
      // APIエラーのモック
      (TwitterApi as jest.Mock).mockImplementationOnce(() => ({
        v2: {
          userByUsername: jest.fn().mockRejectedValue(new Error('API Error')),
        },
      }));

      await expect(TwitterService.getUserTweets('testuser')).rejects.toThrow(
        'API Error'
      );
    });
  });
}); 