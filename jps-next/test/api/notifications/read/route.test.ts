import { testApiHandler } from 'next-test-api-route-handler';
import * as appHandler from '../../../../app/api/notifications/read/route';
import { getAuthenticatedUserId } from '../../../../utils/auth';
import { PrismaClient, NotificationType } from '@prisma/client';

jest.mock("../../../../utils/auth", () => ({
  getAuthenticatedUserId: jest.fn(),
}));

describe('API Tests - /api/notifications/read', () => {
	(getAuthenticatedUserId as jest.Mock).mockResolvedValue("test_user_1");

  describe('PATCH', () => {
    test('ユーザーに紐づく全ての通知が正常に既読状態が更新される場合、204を返す', async () => {
			const prisma = new PrismaClient();
      // 自身に紐づく通知を作成
      await prisma.notification.create({
        data: {
          userId: 'test_user_1',
          type: NotificationType.NEW_PRAISE,
          isRead: false,
        },
      });
      await prisma.notification.create({
        data: {
          userId: 'test_user_1',
          type: NotificationType.SYSTEM_ANNOUNCEMENT,
          isRead: false,
        },
      });
      await prisma.notification.create({
        data: {
          userId: 'test_user_2',
          type: NotificationType.NEW_PRAISE,
          isRead: false,
        },
      });

      await testApiHandler({
        appHandler,
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

      const falseNotifications = await prisma.notification.findMany({
        where: {
          userId: 'test_user_1',
          isRead: false,
        },
      });
      expect(falseNotifications.length).toBe(0);
      const trueNotifications = await prisma.notification.findMany({
        where: {
          userId: 'test_user_2',
          isRead: true,
        },
      });
      expect(trueNotifications.length).toBe(0);
    });
  });
}); 