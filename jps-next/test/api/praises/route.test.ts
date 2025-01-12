import { testApiHandler } from 'next-test-api-route-handler';
import * as appHandler from '../../../app/api/praises/route';
import { PraiseService } from '../../../services/praiseService';

jest.mock('../../../services/praiseService', () => ({
  PraiseService: {
    getPraisesByReceivedUserId: jest.fn(),
    getPraisesByGivenUserId: jest.fn(),
  },
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
});
