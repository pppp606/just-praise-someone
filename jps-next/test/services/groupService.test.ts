import { GroupService } from '../../services/groupService';
import { PrismaClient, Group, GroupUser } from '@prisma/client';

type MockPrismaClient = {
  group: {
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    findUnique: jest.Mock;
  };
  groupUser: {
    findUnique: jest.Mock;
  };
  $transaction: jest.Mock;
};

jest.mock('@prisma/client', () => {
  const mockPrismaClient: MockPrismaClient = {
    group: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    groupUser: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaClient)),
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

describe('GroupService', () => {
  let prisma: MockPrismaClient;

  beforeEach(() => {
    prisma = new PrismaClient() as unknown as MockPrismaClient;
    jest.clearAllMocks();
  });

  describe('getGroups', () => {
    it('should return groups for a user', async () => {
      const mockGroups = [
        {
          id: '1',
          name: 'Test Group',
          isDm: false,
          groupUsers: [
            {
              user: {
                id: '1',
                name: 'Test User',
                email: 'test@example.com',
                profile: {
                  image: 'test.jpg',
                },
              },
            },
          ],
        },
      ];

      prisma.group.findMany.mockResolvedValue(mockGroups);

      const result = await GroupService.getGroups('1', false);

      expect(result).toEqual(mockGroups);
      expect(prisma.group.findMany).toHaveBeenCalledWith({
        where: {
          groupUsers: {
            some: {
              userId: '1',
            },
          },
          isDm: false,
        },
        include: {
          groupUsers: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profile: {
                    select: {
                      image: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          lastMessageAt: 'desc',
        },
      });
    });
  });

  describe('createGroup', () => {
    it('should create a normal group successfully', async () => {
      const mockGroup = {
        id: '1',
        name: 'Test Group',
        isDm: false,
        groupUsers: [
          {
            user: {
              id: '1',
              name: 'Test User',
              email: 'test@example.com',
              profile: {
                image: 'test.jpg',
              },
            },
          },
        ],
      };

      prisma.group.create.mockResolvedValue(mockGroup);

      const result = await GroupService.createGroup('1', {
        name: 'Test Group',
        isDm: false,
        userIds: ['2'],
      });

      expect(result).toEqual(mockGroup);
      expect(prisma.group.create).toHaveBeenCalled();
    });

    it('should create a DM group successfully', async () => {
      const mockGroup = {
        id: '1',
        name: null,
        isDm: true,
        groupUsers: [
          {
            user: {
              id: '1',
              name: 'Test User 1',
              email: 'test1@example.com',
              profile: {
                image: 'test1.jpg',
              },
            },
          },
          {
            user: {
              id: '2',
              name: 'Test User 2',
              email: 'test2@example.com',
              profile: {
                image: 'test2.jpg',
              },
            },
          },
        ],
      };

      prisma.group.create.mockResolvedValue(mockGroup);

      const result = await GroupService.createGroup('1', {
        isDm: true,
        userIds: ['2', '1'],
      });

      expect(result).toEqual(mockGroup);
      expect(prisma.group.create).toHaveBeenCalledWith({
        data: {
          name: null,
          isDm: true,
          groupUsers: {
            create: [
              { userId: '1', isAdmin: false },
              { userId: '2', isAdmin: false },
            ],
          },
        },
        include: {
          groupUsers: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profile: {
                    select: {
                      image: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    });

    it('should throw error when creating DM group with more than 2 users', async () => {
      await expect(
        GroupService.createGroup('1', {
          isDm: true,
          userIds: ['2', '3', '4'],
        })
      ).rejects.toThrow('DMグループには2人のユーザーのみ参加できます');

      expect(prisma.group.create).not.toHaveBeenCalled();
    });
  });

  describe('updateGroupName', () => {
    it('should update group name successfully for admin user', async () => {
      const mockGroupUser = {
        groupId: '1',
        userId: '1',
        isAdmin: true,
      };

      const mockUpdatedGroup = {
        id: '1',
        name: 'Updated Group',
        isDm: false,
        groupUsers: [
          {
            user: {
              id: '1',
              name: 'Test User',
              email: 'test@example.com',
              profile: {
                image: 'test.jpg',
              },
            },
          },
        ],
      };

      prisma.groupUser.findUnique.mockResolvedValue(mockGroupUser);
      prisma.group.update.mockResolvedValue(mockUpdatedGroup);

      const result = await GroupService.updateGroupName('1', '1', {
        name: 'Updated Group',
      });

      expect(result).toEqual(mockUpdatedGroup);
      expect(prisma.group.update).toHaveBeenCalled();
    });

    it('should update group name successfully for DM group', async () => {
      const mockGroupUser = {
        groupId: '1',
        userId: '1',
        isAdmin: false,
      };

      const mockGroup = {
        id: '1',
        isDm: true,
      };

      const mockUpdatedGroup = {
        id: '1',
        name: 'Updated DM Group',
        isDm: true,
        groupUsers: [
          {
            user: {
              id: '1',
              name: 'Test User',
              email: 'test@example.com',
              profile: {
                image: 'test.jpg',
              },
            },
          },
        ],
      };

      prisma.groupUser.findUnique.mockResolvedValue(mockGroupUser);
      prisma.group.findUnique.mockResolvedValue(mockGroup);
      prisma.group.update.mockResolvedValue(mockUpdatedGroup);

      const result = await GroupService.updateGroupName('1', '1', {
        name: 'Updated DM Group',
      });

      expect(result).toEqual(mockUpdatedGroup);
      expect(prisma.group.update).toHaveBeenCalled();
    });

    it('should throw error when user is not admin in non-DM group', async () => {
      const mockGroupUser = {
        groupId: '1',
        userId: '1',
        isAdmin: false,
      };

      const mockGroup = {
        id: '1',
        isDm: false,
      };

      prisma.groupUser.findUnique.mockResolvedValue(mockGroupUser);
      prisma.group.findUnique.mockResolvedValue(mockGroup);

      await expect(
        GroupService.updateGroupName('1', '1', {
          name: 'Updated Group',
        })
      ).rejects.toThrow('管理者権限が必要です');
    });

    it('should throw error when group or user not found', async () => {
      prisma.groupUser.findUnique.mockResolvedValue(null);

      await expect(
        GroupService.updateGroupName('1', '1', {
          name: 'Updated Group',
        })
      ).rejects.toThrow('グループが見つからないか、アクセス権限がありません');
    });
  });
}); 