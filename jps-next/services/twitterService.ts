import { TwitterApi } from 'twitter-api-v2';

// 環境変数のチェック
if (!process.env.TWITTER_BEARER_TOKEN) {
  throw new Error('Missing required environment variable: TWITTER_BEARER_TOKEN');
}

const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);

export interface TwitterUser {
  name: string;
  username: string;
  description: string | undefined;
  metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
  };
}

export interface Tweet {
  id: string;
  text: string;
  created_at: string;
  metrics: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
  };
}

export interface TwitterData {
  user: TwitterUser;
  tweets: Tweet[];
}

export class TwitterService {
  /**
   * @param username - Twitterのユーザー名
   */
  static async getUserTweets(username: string): Promise<TwitterData> {
    try {
      // ユーザー情報を取得
      const user = await twitterClient.v2.userByUsername(username, {
        'user.fields': ['description', 'public_metrics'],
      });

      if (!user.data) {
        throw new Error(`User ${username} not found`);
      }

      // ユーザーのツイートを取得
      const tweets = await twitterClient.v2.userTimeline(user.data.id, {
        max_results: 10,
        'tweet.fields': ['public_metrics', 'created_at'],
      });

      return {
        user: {
          name: user.data.name,
          username: user.data.username,
          description: user.data.description,
          metrics: {
            followers_count: user.data.public_metrics?.followers_count || 0,
            following_count: user.data.public_metrics?.following_count || 0,
            tweet_count: user.data.public_metrics?.tweet_count || 0,
          },
        },
        tweets: tweets.data.data?.map(tweet => ({
          id: tweet.id,
          text: tweet.text,
          created_at: tweet.created_at || '',
          metrics: {
            like_count: tweet.public_metrics?.like_count || 0,
            retweet_count: tweet.public_metrics?.retweet_count || 0,
            reply_count: tweet.public_metrics?.reply_count || 0,
          },
        })) || [],
      };
    } catch (error) {
      console.error('Error fetching Twitter data:', error);
      throw error;
    }
  }
}
