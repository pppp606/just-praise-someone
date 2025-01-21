import axios from 'axios';

export class TwitterService {
  private static API_URL = 'https://api.twitter.com/2';
  private static BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

  /**
   * @param twitterUsername - Twitterのユーザー名
   * @param maxTweets - 最大取得件数（デフォルト5件）
   */
  static async getUserTweets(
    twitterUsername: string,
    maxTweets: number = 5
  ): Promise<{ tweets: string[] }> {
    if (!this.BEARER_TOKEN) {
      throw new Error(
        'Twitter Bearer Token is not set in environment variables.'
      );
    }

    try {
      // ユーザーIDを取得
      const userResponse = await axios.get(
        `${this.API_URL}/users/by/username/${twitterUsername}`,
        {
          headers: {
            Authorization: `Bearer ${this.BEARER_TOKEN}`,
          },
        }
      );

      const userId = userResponse.data.data.id;

      // 最新ツイートを取得
      const tweetResponse = await axios.get(
        `${this.API_URL}/users/${userId}/tweets`,
        {
          headers: {
            Authorization: `Bearer ${this.BEARER_TOKEN}`,
          },
          params: {
            max_results: maxTweets,
            'tweet.fields': 'text',
          },
        }
      );

      // ツイートのテキスト部分を整形
      const tweets = tweetResponse.data.data.map((tweet: any) =>
        tweet.text
          .replace(/https?:\/\/\S+/g, '') // URLを削除
          .replace(/@\w+/g, '') // メンションを削除
          .replace(/#\w+/g, '') // ハッシュタグを削除
          .trim()
      );

      return { tweets };
    } catch (error) {
      return { tweets: [] }; // エラー時は空配列を返す
    }
  }
}
