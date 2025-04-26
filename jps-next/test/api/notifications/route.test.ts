import { testApiHandler } from 'next-test-api-route-handler';
import * as appHandler from '../../../app/api/notifications/route';
import { NotificationService } from '../../../services/notificationService';

jest.mock('../../../services/notificationService', () => ({
  NotificationService: {
    getNotifications: jest.fn(),
  },
}));

describe('/api/notifications GET', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('通知が返る場合、200とデータを返す', async () => {
    const mockData = {
      items: [
        {
          id: '1',
          userId: 'user1',
          metadata: {},
          createdAt: new Date('2025-04-26T14:11:04.176Z'),
        },
      ],
      count: 1,
      total: 1,
      totalPages: 1,
    };
    (NotificationService.getNotifications as jest.Mock).mockResolvedValue(mockData);

    await testApiHandler({
      appHandler,
      url: '/api/notifications?page=1',
      requestPatcher: (request) => {
        request.headers.set('user_id', 'user1');
        return request;
      },
      test: async ({ fetch }) => {
        const response = await fetch({ method: 'GET' });
        expect(response.status).toBe(200);
        const json = await response.json();
        expect(json.items[0].createdAt).toBe(mockData.items[0].createdAt.toISOString());
        expect(json.items[0].id).toBe(mockData.items[0].id);
        expect(json.items[0].userId).toBe(mockData.items[0].userId);
        expect(json.items[0].metadata).toEqual(mockData.items[0].metadata);
        expect(NotificationService.getNotifications).toHaveBeenCalled();
      },
    });
  });

  test('通知が空の場合、200と空配列を返す', async () => {
    const mockData = {
      items: [],
      count: 0,
      total: 0,
      totalPages: 0,
    };
    (NotificationService.getNotifications as jest.Mock).mockResolvedValue(mockData);

    await testApiHandler({
      appHandler,
      url: '/api/notifications?page=1',
      requestPatcher: (request) => {
        request.headers.set('user_id', 'user1');
        return request;
      },
      test: async ({ fetch }) => {
        const response = await fetch({ method: 'GET' });
        expect(response.status).toBe(200);
        const json = await response.json();
        expect(json).toEqual(mockData);
      },
    });
  });

  test('サービス層でエラーが発生した場合、500を返す', async () => {
    (NotificationService.getNotifications as jest.Mock).mockRejectedValue(new Error('DB Error'));

    await testApiHandler({
      appHandler,
      url: '/api/notifications?page=1',
      requestPatcher: (request) => {
        request.headers.set('user_id', 'user1');
        return request;
      },
      test: async ({ fetch }) => {
        const response = await fetch({ method: 'GET' });
        expect(response.status).toBe(500);
        const json = await response.json();
        expect(json).toEqual({ error: 'DB Error' });
      },
    });
  });
}); 