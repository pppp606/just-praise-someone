import { Prisma } from '@prisma/client';

export type NotificationWithMetadata = Prisma.NotificationGetPayload<{
  include: {
    metadata: true;
  };
}>;

export type NotificationResponse = {
  id: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  metadata: Record<string, string>;
}; 