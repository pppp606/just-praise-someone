import { UserService } from '../../services/userService';
import { PrismaClient } from '@prisma/client';

describe('UserProfileService', () => {
  describe('excludeDataNotCurrentUser', () => {
    it('should exclude fields', () => {
      const user = {
        email: 'test@test.com',
        name: 'test',
      };

      UserService.excludeDataNotCurrentUser(user);
      expect(user).toEqual({
        email: '',
        name: 'test',
      });
    });
  });

  describe('generateSnsUrls', () => {
    it('should return sns urls', () => {
      const snsLinks = {
        x: 'username1',
        zenn: 'username2',
        qiita: 'username3',
        note: 'username4',
      };
      const result = UserService.generateSnsUrls(snsLinks);
      expect(result).toEqual({
        x: 'https://x.com/username1',
        zenn: 'https://zenn.dev/username2',
        qiita: 'https://qiita.com/username3',
        note: 'https://note.com/username4',
      });
    });
  });

  describe('validateSnsLinks;', () => {
    it('should return true if sns links are valid', () => {
      const snsLinks = {
        x: 'username1',
        zenn: 'username2',
        qiita: 'username3',
        note: 'username4',
      };
      const result = UserService.validateSnsLinks(snsLinks);
      expect(result).toBe(true);
    });

    it('should return true if sns links are valid', () => {
      const snsLinks = {
        x: 'username1',
        zenn: 'username2',
      };
      const result = UserService.validateSnsLinks(snsLinks);
      expect(result).toBe(true);
    });

    it('should return false if sns links are invalid', () => {
      const snsLinks = {
        xxx: 'username1',
        zenn: 'username2',
        qiita: 'username3',
        note: 'username4',
      };
      const result = UserService.validateSnsLinks(snsLinks);
      expect(result).toBe(false);
    });

    it('should return false if sns links are invalid', () => {
      const snsLinks = {
        x: 'a'.repeat(31),
      };
      const result = UserService.validateSnsLinks(snsLinks);
      expect(result).toBe(false);
    });
  });

  describe('updateUserWithProfile', () => {
    it('should update user with profile', async () => {
      const data = {
        name: 'update name',
        profile: {
          bio: 'update description',
          snsLinks: {
            x: 'update_username1',
          },
        },
      };

      const prisma = new PrismaClient();
      const user = await prisma.user.findFirst();

      if (!user) {
        throw new Error('User not found');
      }

      await UserService.updateUserWithProfile(user.id, data);

      const updateUser = await prisma.user.findFirst({
        where: {
          id: user.id,
        },
      });

      const updateProfile = await prisma.userProfile.findFirst({
        where: {
          userId: user.id,
        },
      });

      if (!updateUser || !updateProfile) {
        throw new Error('User not found');
      }

      expect(updateUser.name).toBe('update name');
      expect(updateProfile.bio).toBe('update description');
      expect(updateProfile.snsLinks).toEqual({
        x: 'update_username1',
      });
    });
  });
});
