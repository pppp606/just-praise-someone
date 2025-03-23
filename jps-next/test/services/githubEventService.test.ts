import { GithubEventService } from '../../services/githubEventService';
import { mockGithubData } from '../mocks/githubData';
import axios from 'axios';

// axiosのモック
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GithubEventService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserPublicEvents', () => {
    it('ユーザー情報とイベントを正しく取得できること', async () => {
      // イベント取得のモック
      mockedAxios.get.mockResolvedValueOnce({
        data: mockGithubData.event.map(event => ({
          type: event.type,
          repo: {
            name: event.repoName,
          },
          payload: {
            pull_request: event.type === 'PullRequestEvent' ? {
              title: event.title,
              body: event.body,
            } : undefined,
            issue: event.type === 'IssueEvent' ? {
              title: event.title,
              body: event.body,
            } : undefined,
            commits: event.commits,
          },
        })),
      });

      // ユーザー情報取得のモック
      mockedAxios.get.mockResolvedValueOnce({
        data: mockGithubData.user,
      });

      const result = await GithubEventService.getUserPublicEvents('testuser');

      expect(result).toEqual(mockGithubData);
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    it('ユーザーが見つからない場合エラーをスローすること', async () => {
      // ユーザーが見つからない場合のモック
      mockedAxios.get.mockRejectedValueOnce(new Error('Not Found'));

      await expect(GithubEventService.getUserPublicEvents('nonexistent')).rejects.toThrow(
        'Not Found'
      );
    });

    it('APIエラーが発生した場合エラーをスローすること', async () => {
      // APIエラーのモック
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(GithubEventService.getUserPublicEvents('testuser')).rejects.toThrow(
        'API Error'
      );
    });

    it('イベントが取得できない場合でもユーザー情報は返すこと', async () => {
      // イベント取得エラーのモック
      mockedAxios.get
        .mockResolvedValueOnce({ data: [] }) // イベント取得
        .mockResolvedValueOnce({ data: mockGithubData.user }); // ユーザー情報取得

      const result = await GithubEventService.getUserPublicEvents('testuser');

      expect(result.user).toEqual(mockGithubData.user);
      expect(result.event).toEqual([]);
    });
  });
}); 