import { testApiHandler } from 'next-test-api-route-handler';
import * as appHandler from '../../../app/api/praises/route';
import { PraiseService } from '../../../services/praiseService';
import { getAuthenticatedUserId } from '../../../utils/auth';
import { ErrorCode } from '../../../utils/errorHandler';

jest.mock('../../../services/praiseService', () => ({
  PraiseService: {
    getPraisesByReceivedUserId: jest.fn(),
    getPraisesByGivenUserId: jest.fn(),
    createPraise: jest.fn(),
  },
}));

jest.mock('../../../utils/auth', () => ({
  getAuthenticatedUserId: jest.fn(),
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe('API Tests - /api/praise', () => {
  describe('GET', () => {
    test('userIdが不足している場合、エラーを返す', async () => {
      await testApiHandler({
        appHandler,
        url: '/api/praises?userId=&type=received&page=1',
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'GET',
          });

          expect(response.status).toBe(400);
          const body = await response.json();
          expect(body.error).toBe('Validation error');
        },
      });
    });

    test('typeが存在しない場合、getPraisesByReceivedUserIdが一度呼ばれる', async () => {
      await testApiHandler({
        appHandler,
        url: '/api/praises?userId=test_user_1&page=1',
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'GET',
          });

          expect(response.status).toBe(200);
          expect(
            PraiseService.getPraisesByReceivedUserId
          ).toHaveBeenCalledTimes(1);
          expect(PraiseService.getPraisesByReceivedUserId).toHaveBeenCalledWith(
            'test_user_1',
            1
          );
        },
      });
    });

    test('typeがreceivedの場合、getPraisesByReceivedUserIdが一度呼ばれる', async () => {
      await testApiHandler({
        appHandler,
        url: '/api/praises?userId=test_user_1&type=received&page=1',
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'GET',
          });

          expect(response.status).toBe(200);
          expect(
            PraiseService.getPraisesByReceivedUserId
          ).toHaveBeenCalledTimes(1);
          expect(PraiseService.getPraisesByReceivedUserId).toHaveBeenCalledWith(
            'test_user_1',
            1
          );
        },
      });
    });

    test('typeがgivenの場合、getPraisesByGivenUserIdが一度呼ばれる', async () => {
      await testApiHandler({
        appHandler,
        url: '/api/praises?userId=test_user_1&type=given&page=1',
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'GET',
          });

          expect(response.status).toBe(200);
          expect(PraiseService.getPraisesByGivenUserId).toHaveBeenCalledTimes(
            1
          );
          expect(PraiseService.getPraisesByGivenUserId).toHaveBeenCalledWith(
            'test_user_1',
            1
          );
        },
      });
    });

    test('pageが存在しない場合、デフォルトで1が設定される', async () => {
      await testApiHandler({
        appHandler,
        url: '/api/praises?userId=test_user_1&type=received',
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'GET',
          });

          expect(response.status).toBe(200);
          expect(
            PraiseService.getPraisesByReceivedUserId
          ).toHaveBeenCalledTimes(1);
          expect(PraiseService.getPraisesByReceivedUserId).toHaveBeenCalledWith(
            'test_user_1',
            1
          );
        },
      });
    });

    test('pageが設定されている場合、設定された値が渡される', async () => {
      await testApiHandler({
        appHandler,
        url: '/api/praises?userId=test_user_1&type=received&page=2',
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'GET',
          });

          expect(response.status).toBe(200);
          expect(
            PraiseService.getPraisesByReceivedUserId
          ).toHaveBeenCalledTimes(1);
          expect(PraiseService.getPraisesByReceivedUserId).toHaveBeenCalledWith(
            'test_user_1',
            2
          );
        },
      });
    });
  });

  describe('POST', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('正常なリクエストの場合、createPraiseが正しい引数で呼ばれる', async () => {
      const mockUserId = 'test_user_1';
      (getAuthenticatedUserId as jest.Mock).mockResolvedValue(mockUserId);
      (PraiseService.createPraise as jest.Mock).mockResolvedValue({});

      await testApiHandler({
        appHandler,
        test: async ({ fetch }) => {
          const requestBody = {
            content: '素晴らしいコードです',
            receivedUserId: 'test_user_2',
            skills: ['code_quality'],
          };

          const response = await fetch({
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          expect(response.status).toBe(201);
          expect(PraiseService.createPraise).toHaveBeenCalledTimes(1);
          expect(PraiseService.createPraise).toHaveBeenCalledWith({
            givenUserId: mockUserId,
            receivedUserId: requestBody.receivedUserId,
            content: requestBody.content,
            skillCodes: requestBody.skills,
          });
        },
      });
    });

    test('認証されていない場合、createPraiseは呼ばれない', async () => {
      (getAuthenticatedUserId as jest.Mock).mockResolvedValue(null);

      await testApiHandler({
        appHandler,
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              content: '素晴らしいコードです',
              receivedUserId: 'test_user_2',
              skills: ['code_quality'],
            }),
          });

          expect(response.status).toBe(401);
          expect(PraiseService.createPraise).not.toHaveBeenCalled();
        },
      });
    });

    test('必須パラメータが不足している場合、createPraiseは呼ばれない', async () => {
      const mockUserId = 'test_user_1';
      (getAuthenticatedUserId as jest.Mock).mockResolvedValue(mockUserId);

      await testApiHandler({
        appHandler,
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              content: '素晴らしいコードです',
            }),
          });

          expect(response.status).toBe(400);
          expect(PraiseService.createPraise).not.toHaveBeenCalled();
        },
      });
    });

    test('サービスエラーが発生した場合、500を返す', async () => {
      const mockUserId = 'test_user_1';
      (getAuthenticatedUserId as jest.Mock).mockResolvedValue(mockUserId);
      (PraiseService.createPraise as jest.Mock).mockRejectedValue(new Error('Service error'));

      await testApiHandler({
        appHandler,
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              content: '素晴らしいコードです',
              receivedUserId: 'test_user_2',
              skills: ['code_quality'],
            }),
          });

          expect(response.status).toBe(500);
          expect(PraiseService.createPraise).toHaveBeenCalledTimes(1);
        },
      });
    });
  });
});
