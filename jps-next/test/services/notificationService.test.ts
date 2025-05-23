import { NotificationType, PrismaClient } from '@prisma/client';
import { NotificationService } from '../../services/notificationService';
import { ErrorCode } from '../../utils/errorHandler';

describe('NotificationService', () => {
  const mockFindMany = jest.fn();
  const mockCount = jest.fn();
  const mockFindUnique = jest.fn();
  const mockUpdateMany = jest.fn();

  beforeAll(() => {
    // NotificationService.prismaをモック
    NotificationService.prisma.findMany = mockFindMany;
    NotificationService.prisma.count = mockCount;
    NotificationService.prisma.findUnique = mockFindUnique;
    NotificationService.prisma.updateMany = mockUpdateMany;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('通知が存在する場合、正しいデータを返す', async () => {
    const mockNotifications = [
      { id: '1', userId: 'user1', metadata: {}, createdAt: new Date() },
      { id: '2', userId: 'user1', metadata: {}, createdAt: new Date() },
    ];
    mockFindMany.mockResolvedValue(mockNotifications);
    mockCount.mockResolvedValue(2);

    const result = await NotificationService.getNotifications('user1', 1);

    expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: 'user1' },
      skip: 0,
      take: 10,
    }));
    expect(mockCount).toHaveBeenCalledWith({ where: { userId: 'user1' } });
    expect(result.items).toEqual(mockNotifications);
    expect(result.count).toBe(2);
    expect(result.totalPages).toBe(1);
  });

  it('通知が存在しない場合、空配列と0件を返す', async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    const result = await NotificationService.getNotifications('user1', 1);

    expect(result.items).toEqual([]);
    expect(result.count).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it('2ページ目のデータ取得時、skip/takeが正しく設定される', async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(15);

    await NotificationService.getNotifications('user1', 2);

    expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({
      skip: 10,
      take: 10,
    }));
  });

  it('PrismaのfindManyでエラーが発生した場合、例外を投げる', async () => {
    mockFindMany.mockRejectedValue(new Error('DB Error'));
    mockCount.mockResolvedValue(0);

    await expect(NotificationService.getNotifications('user1', 1)).rejects.toThrow('DB Error');
  });

  describe('updateReadStatus', () => {
    it('更新が実行される', async () => {
      await NotificationService.updateReadStatus('test_user_1');
      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: { userId: 'test_user_1' },
        data: { isRead: true },
      });
    });

    it('Prismaのupdateでエラーが発生した場合、例外を投げる', async () => {
      const prisma = new PrismaClient();
      await prisma.notification.create({
        data: {
          userId: 'test_user_1',
          type: NotificationType.NEW_PRAISE,
          isRead: false,
        },
      });

      mockUpdateMany.mockRejectedValue(new Error('DB Error'));
      await expect(NotificationService.updateReadStatus('test_user_1')).rejects.toThrow('DB Error');
    });
  });
}); 