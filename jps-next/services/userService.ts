import { PrismaClient } from '@prisma/client';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PutUserWithProfileRequest } from '../types/request';

export type GithubUser = {
  id: string;
  name: string;
  email: string;
  image?: string;
};

export type GithubProfile = {
  login: string;
  avatar_url: string;
  bio: string;
  twitter_username: string;
};

export const CustomPrismaAdapter = (prisma: PrismaClient) => {
  const adapter = PrismaAdapter(prisma);

  return {
    ...adapter,
    async createUser(user: any) {
      const prisma = new PrismaClient();
      const createdUser = await prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
        },
      });

      return createdUser;
    },
  };
};

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

  // 初回ログイン時にユーザー情報を更新
  static async registerGithubUserProfile(
    providerAccountId: string,
    profile: GithubProfile
  ) {
    const prisma = new PrismaClient();
    await prisma.userProfile.create({
      data: {
        providerAccountId: providerAccountId,
        providerUserId: profile.login,
        bio: profile?.bio || '',
        image: profile.avatar_url,
        snsLinks: profile?.twitter_username
          ? {
              x: profile.twitter_username,
            }
          : {},
      },
    });
  }
}
