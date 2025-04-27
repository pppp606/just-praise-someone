import { testApiHandler } from 'next-test-api-route-handler';
import * as appHandler from '../../../../../app/api/notifications/[id]/read/route';
import { getAuthenticatedUserId } from '../../../../../utils/auth';
import { PrismaClient, NotificationType } from '@prisma/client';

jest.mock("../../../../../utils/auth", () => ({
  getAuthenticatedUserId: jest.fn(),
}));

describe('API Tests - /api/notifications/${id}/read', () => {
	(getAuthenticatedUserId as jest.Mock).mockResolvedValue("test_user_1");

  describe('PATCH', () => {
    test('通知が存在しない場合、404エラーを返す', async () => {
      await testApiHandler({
        appHandler,
        paramsPatcher: (params) => ({ id: 'non-existent-id' }),
        test: async ({ fetch }) => {
          const result = await fetch({
            method: 'PATCH',
          });
          expect(result.status).toBe(404);
          const body = await result.json();
          expect(body).toEqual({ error: 'Resource not found' });
        },
      });
    });

    test('通知の所有者でない場合、404エラーを返す', async () => {
			const prisma = new PrismaClient();
      const notification = await prisma.notification.create({
        data: {
          userId: 'test_user_2',
          type: NotificationType.NEW_PRAISE,
          isRead: false,
        },
      });

      await testApiHandler({
        appHandler,
        paramsPatcher: (params) => ({ id: notification.id }),
        requestPatcher: (request) => {
          request.headers.set('user_id', 'test_user_2');
          return request;
        },
        test: async ({ fetch }) => {
          const result = await fetch({
            method: 'PATCH',
          });
          expect(result.status).toBe(404);
          const body = await result.json();
          expect(body).toEqual({ error: 'Resource not found' });
        },
      });
    });

    test('正常に既読状態が更新される場合、204を返す', async () => {
			const prisma = new PrismaClient();
      const notification = await prisma.notification.create({
        data: {
          userId: 'test_user_1',
          type: NotificationType.NEW_PRAISE,
          isRead: false,
        },
      });

      await testApiHandler({
        appHandler,
        paramsPatcher: (params) => ({ id: notification.id }),
        requestPatcher: (request) => {
          request.headers.set('user_id', 'test_user_1');
          return request;
        },
        test: async ({ fetch }) => {
          const result = await fetch({
            method: 'PATCH',
          });
          expect(result.status).toBe(204);
        },
      });

      const updatedNotification = await prisma.notification.findUnique({
        where: { id: notification.id },
      });
      expect(updatedNotification?.isRead).toBe(true);
    });
  });
}); 