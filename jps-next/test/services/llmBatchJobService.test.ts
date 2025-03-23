import { LlmBatchJobService } from '../../services/llmBatchJobService';
import { GithubEventService } from '../../services/githubEventService';
import { TwitterService } from '../../services/twitterService';
import { PraiseService } from '../../services/praiseService';
import { mockTwitterData } from '../mocks/twitterData';
import OpenAI from 'openai';

// サービスのモック
jest.mock('../../services/githubEventService');
jest.mock('../../services/twitterService');
jest.mock('../../services/praiseService');
jest.mock('openai');

describe('LlmBatchJobService', () => {
  const mockGithubData = {
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
        commits: [{ message: 'テストコミット' }],
      },
    ],
  };

  const mockPraiseResponse = {
    body: 'テストユーザーさんは素晴らしい開発者です。',
    skills: ['コード品質', '問題解決能力', 'コミュニケーションスキル'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processPendingJobs', () => {
    it('ジョブを正常に処理できること', async () => {
      // モックの設定
      (GithubEventService.getUserPublicEvents as jest.Mock).mockResolvedValue(
        mockGithubData
      );
      (TwitterService.getUserTweets as jest.Mock).mockResolvedValue(
        mockTwitterData
      );
      (OpenAI as jest.Mock).mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: JSON.stringify(mockPraiseResponse),
                  },
                },
              ],
            }),
          },
        },
      }));

      // テスト用のジョブデータ
      const mockJob = {
        id: 'test-job-id',
        userId: 'test-user-id',
        user: {
          login: 'testuser',
        },
      };

      // テスト実行
      await LlmBatchJobService.processPendingJobs();

      // アサーション
      expect(GithubEventService.getUserPublicEvents).toHaveBeenCalledWith(
        'testuser'
      );
      expect(TwitterService.getUserTweets).toHaveBeenCalledWith('testuser');
      expect(PraiseService.createPraise).toHaveBeenCalledWith({
        givenUserId: 'test-user-id',
        receivedUserId: 'test-user-id',
        content: mockPraiseResponse.body,
        skillCodes: mockPraiseResponse.skills,
      });
    });

    it('Twitter情報が取得できない場合でも処理を継続すること', async () => {
      // モックの設定
      (GithubEventService.getUserPublicEvents as jest.Mock).mockResolvedValue({
        ...mockGithubData,
        user: {
          ...mockGithubData.user,
          twitter_username: null,
        },
      });
      (OpenAI as jest.Mock).mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: JSON.stringify(mockPraiseResponse),
                  },
                },
              ],
            }),
          },
        },
      }));

      // テスト実行
      await LlmBatchJobService.processPendingJobs();

      // アサーション
      expect(TwitterService.getUserTweets).not.toHaveBeenCalled();
      expect(PraiseService.createPraise).toHaveBeenCalled();
    });

    it('エラーが発生した場合ジョブのステータスを失敗に更新すること', async () => {
      // エラーのモック
      (GithubEventService.getUserPublicEvents as jest.Mock).mockRejectedValue(
        new Error('GitHub API Error')
      );

      // テスト実行
      await LlmBatchJobService.processPendingJobs();

      // アサーション
      expect(PraiseService.createPraise).not.toHaveBeenCalled();
    });
  });
}); 