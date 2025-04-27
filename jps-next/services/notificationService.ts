import { PrismaClient, Prisma } from '@prisma/client';
import { ErrorCode } from '../utils/errorHandler';

const prisma = new PrismaClient();
const PAGE_SIZE = 10;

export type NotificationWithMetadata = Prisma.NotificationGetPayload<{
  include: {
    metadata: true;
  };
}>;

export class NotificationService {
  static prisma = prisma.notification;

  static async getNotifications(userId: string, page: number = 1) {
    const [notifications, count] = await Promise.all([
      this.prisma.findMany({
        where: {
          userId,
        },
        include: {
          metadata: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      this.prisma.count({
        where: {
          userId,
        },
      }),
    ]);

    const totalPages = Math.ceil(count / PAGE_SIZE);

    return {
      items: notifications,
      count,
      total: count,
      totalPages,
    };
  }

  static async updateReadStatus(id: string, userId: string) {
    const notification = await this.prisma.findUnique({
      where: { id, userId },
    });

    if (!notification) {
      throw {
        code: ErrorCode.NotFound,
      };
    }

    await this.prisma.update({
      where: { id },
      data: { isRead: true },
    });
  }
} 