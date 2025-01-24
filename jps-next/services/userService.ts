import { PrismaClient } from '@prisma/client';
import { PutUserWithProfileRequest } from '../types/request';

export class UserService {
  // 自分以外のユーザー情報から除外する項目
  private static notCurrentUserExcludeFields = ['email'];

  static excludeDataNotCurrentUser(user: Record<string, any>) {
    this.notCurrentUserExcludeFields.forEach((field) => {
      user[field] = '';
    });
  }

  private static snsConfig: Record<
    string,
    {
      baseURL: string;
    }
  > = {
    x: {
      baseURL: 'https://x.com/',
    },
    zenn: {
      baseURL: 'https://zenn.dev/',
    },
    qiita: {
      baseURL: 'https://qiita.com/',
    },
    note: {
      baseURL: 'https://note.com/',
    },
  };

  static generateSnsUrls(snsLinks: Record<string, string>) {
    return Object.entries(snsLinks).reduce(
      (acc, [key, username]) => {
        const config = this.snsConfig[key];
        if (config) {
          acc[key] = `${config.baseURL}${username}`;
        }
        return acc;
      },
      {} as Record<string, string>
    );
  }

  static validateSnsLinks(snsLinks: Record<string, string>) {
    return Object.entries(snsLinks).every(([key, username]) => {
      const config = this.snsConfig[key];
      if (!config) {
        return false;
      }
      return username.length <= 30;
    });
  }

  static async updateUserWithProfile(
    userId: string,
    data: PutUserWithProfileRequest
  ) {
    const prisma = new PrismaClient();
    const { profile, ...user } = data;

    if (!this.validateSnsLinks(profile.snsLinks)) {
      throw new Error('Invalid sns links');
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          name: user.name,
          profile: {
            upsert: {
              create: { bio: profile.bio, snsLinks: profile.snsLinks },
              update: { bio: profile.bio, snsLinks: profile.snsLinks },
            },
          },
        },
        include: { profile: true },
      });
    });

    return updatedUser;
  }
}
