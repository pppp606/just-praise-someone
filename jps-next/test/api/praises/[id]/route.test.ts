import { testApiHandler } from 'next-test-api-route-handler';
import * as appHandler from '../../../../app/api/praises/[id]/route';
import { PrismaClient } from '@prisma/client';
import { getAuthenticatedUserId } from '../../../../utils/auth';

jest.mock("../../../../utils/auth", () => ({
  getAuthenticatedUserId: jest.fn(),
}));

describe('API Tests - /api/praise/${id}', () => {
  (getAuthenticatedUserId as jest.Mock).mockResolvedValue("test_user_1");

  describe('GET', () => {
    test('データが存在しない場合、404エラーを返す', async () => {
      await testApiHandler({
        appHandler,
        paramsPatcher: (params) => ({ id: '1' }),
        test: async ({ fetch }) => {
          const result = await fetch({
            method: 'GET',
          });
          expect(result.status).toBe(404);
          const body = await result.json();
          expect(body).toEqual({ error: 'Resource not found' });
        },
      });
    });

    test('データが存在する場合、データを返す', async () => {
      const prisma = new PrismaClient();
      const skill = await prisma.skill.findFirst({
        where: { code: 'code_quality' },
      });
      if (!skill) {
        throw new Error('Skill not found');
      }

      const praise = await prisma.praise.create({
        data: {
          content: 'message',
          receivedUserId: 'test_user_1',
          skills: {
            create: [{ skillId: skill.id }],
          },
          givenUserId: 'test_user_2',
        },
      });

      await testApiHandler({
        appHandler,
        paramsPatcher: (params) => ({ id: praise.id }),
        test: async ({ fetch }) => {
          const result = await fetch({
            method: 'GET',
          });
          expect(result.status).toBe(200);
          const body = await result.json();
          expect(body).toEqual({
            id: praise.id,
            content: praise.content,
            givenUserId: praise.givenUserId,
            receivedUserId: praise.receivedUserId,
            skillCodes: [skill.code],
            isApproved: praise.isApproved,
            createdAt: praise.createdAt.toISOString(),
            updatedAt: praise.updatedAt.toISOString(),
          });
        },
      });
    });
  });

  describe('PUT', () => {
    test('データが存在しない場合、404エラーを返す', async () => {
      await testApiHandler({
        appHandler,
        paramsPatcher: (params) => ({ id: '1' }),
        test: async ({ fetch }) => {
          const result = await fetch({
            method: 'PUT',
            body: JSON.stringify({
              content: 'updated message',
              skillCodes: ['code_quality'],
            }),
          });
          expect(result.status).toBe(404);
          const body = await result.json();
          expect(body).toEqual({ error: 'Resource not found' });
        },
      });
    });

    test('user-idが更新対象のデータのgivenUserIdと一致しない場合、404エラーを返す', async () => {
      const prisma = new PrismaClient();
      const skill = await prisma.skill.findFirst({
        where: { code: 'code_quality' },
      });
      if (!skill) {
        throw new Error('Skill not found');
      }

      const praise = await prisma.praise.create({
        data: {
          content: 'message',
          receivedUserId: 'test_user_1',
          skills: {
            create: [{ skillId: skill.id }],
          },
          givenUserId: 'test_user_2',
        },
      });

      await testApiHandler({
        appHandler,
        paramsPatcher: (params) => ({ id: praise.id }),
        test: async ({ fetch }) => {
          const result = await fetch({
            method: 'PUT',
            body: JSON.stringify({
              content: 'updated message',
              skillCodes: ['code_quality'],
            }),
          });
          expect(result.status).toBe(404);
          const body = await result.json();
          expect(body).toEqual({ error: 'Resource not found' });
        },
      });
    });

    test('データが存在しuser-idが更新対象のデータのgivenUserIdと一致する場合、データを更新する', async () => {
      const prisma = new PrismaClient();
      const skill = await prisma.skill.findFirst({
        where: { code: 'code_quality' },
      });
      if (!skill) {
        throw new Error('Skill not found');
      }

      const praise = await prisma.praise.create({
        data: {
          content: 'message',
          receivedUserId: 'test_user_2',
          skills: {
            create: [{ skillId: skill.id }],
          },
          givenUserId: 'test_user_1',
        },
      });

      await testApiHandler({
        appHandler,
        paramsPatcher: (params) => ({ id: praise.id }),
        test: async ({ fetch }) => {
          const result = await fetch({
            method: 'PUT',
            body: JSON.stringify({
              content: 'updated message',
              skillCodes: ['code_quality'],
            }),
          });
          expect(result.status).toBe(200);
          const body = await result.json();
          expect(body).toEqual({
            id: praise.id,
            content: 'updated message',
            givenUserId: praise.givenUserId,
            receivedUserId: praise.receivedUserId,
            skillCodes: [skill.code],
            isApproved: praise.isApproved,
            createdAt: praise.createdAt.toISOString(),
            updatedAt: expect.any(String),
          });
        },
      });

      const updatedPraise = await prisma.praise.findUnique({
        where: { id: praise.id },
      });
      expect(updatedPraise?.content).toBe('updated message');
    });
  });

  describe('DELETE', () => {
    test('データが存在しない場合、404エラーを返す', async () => {
      await testApiHandler({
        appHandler,
        paramsPatcher: (params) => ({ id: '1' }),
        test: async ({ fetch }) => {
          const result = await fetch({
            method: 'DELETE',
          });
          expect(result.status).toBe(404);
          const body = await result.json();
          expect(body).toEqual({ error: 'Resource not found' });
        },
      });
    });

    test('user-idが削除対象のデータのgivenUserIdと一致しない場合、404エラーを返す', async () => {
      const prisma = new PrismaClient();
      const skill = await prisma.skill.findFirst({
        where: { code: 'code_quality' },
      });
      if (!skill) {
        throw new Error('Skill not found');
      }

      const praise = await prisma.praise.create({
        data: {
          content: 'message',
          receivedUserId: 'test_user_1',
          skills: {
            create: [{ skillId: skill.id }],
          },
          givenUserId: 'test_user_2',
        },
      });

      await testApiHandler({
        appHandler,
        paramsPatcher: (params) => ({ id: praise.id }),
        test: async ({ fetch }) => {
          const result = await fetch({
            method: 'DELETE',
          });
          expect(result.status).toBe(404);
          const body = await result.json();
          expect(body).toEqual({ error: 'Resource not found' });
        },
      });
    });

    test('データが存在しuser-idが削除対象のデータのgivenUserIdと一致する場合、データを削除する', async () => {
      const prisma = new PrismaClient();
      const skill = await prisma.skill.findFirst({
        where: { code: 'code_quality' },
      });
      if (!skill) {
        throw new Error('Skill not found');
      }

      const praise = await prisma.praise.create({
        data: {
          content: 'message',
          receivedUserId: 'test_user_2',
          skills: {
            create: [{ skillId: skill.id }],
          },
          givenUserId: 'test_user_1',
        },
      });

      await testApiHandler({
        appHandler,
        paramsPatcher: (params) => ({ id: praise.id }),
        test: async ({ fetch }) => {
          const result = await fetch({
            method: 'DELETE',
          });
          expect(result.status).toBe(200);
          const body = await result.json();
          expect(body).toEqual({ message: 'Praise deleted successfully' });
        },
      });

      const deletedPraise = await prisma.praise.findUnique({
        where: { id: praise.id },
      });
      expect(deletedPraise).toBeNull();
    });
  });

  describe('PATCH', () => {
    test('データが存在しない場合、404エラーを返す', async () => {
      await testApiHandler({
        appHandler,
        paramsPatcher: (params) => ({ id: '1' }),
        test: async ({ fetch }) => {
          const result = await fetch({
            method: 'PATCH',
            body: JSON.stringify({
              isApproved: true,
            }),
          });
          expect(result.status).toBe(404);
          const body = await result.json();
          expect(body).toEqual({ error: 'Resource not found' });
        },
      });
    });

    test('user-idが更新対象のデータのreceivedUserIdが一致しない場合、404エラーを返す', async () => {
      const prisma = new PrismaClient();
      const skill = await prisma.skill.findFirst({
        where: { code: 'code_quality' },
      });
      if (!skill) {
        throw new Error('Skill not found');
      }

      const praise = await prisma.praise.create({
        data: {
          content: 'message',
          receivedUserId: 'test_user_2',
          skills: {
            create: [{ skillId: skill.id }],
          },
          givenUserId: 'test_user_1',
        },
      });

      await testApiHandler({
        appHandler,
        paramsPatcher: (params) => ({ id: praise.id }),
        test: async ({ fetch }) => {
          const result = await fetch({
            method: 'PATCH',
            body: JSON.stringify({
              isApproved: true,
            }),
          });
          expect(result.status).toBe(404);
          const body = await result.json();
          expect(body).toEqual({ error: 'Resource not found' });
        },
      });
    });

    test('データが存在しuser-idが更新対象のデータのreceivedUserIdが一致する場合、データを更新する', async () => {
      const prisma = new PrismaClient();
      const skill = await prisma.skill.findFirst({
        where: { code: 'code_quality' },
      });
      if (!skill) {
        throw new Error('Skill not found');
      }

      const praise = await prisma.praise.create({
        data: {
          content: 'message',
          receivedUserId: 'test_user_1',
          skills: {
            create: [{ skillId: skill.id }],
          },
          givenUserId: 'test_user_2',
        },
      });

      await testApiHandler({
        appHandler,
        paramsPatcher: (params) => ({ id: praise.id }),
        test: async ({ fetch }) => {
          const result = await fetch({
            method: 'PATCH',
            body: JSON.stringify({
              isApproved: true,
            }),
          });
          expect(result.status).toBe(200);
          const body = await result.json();
          expect(body).toEqual({
            id: praise.id,
            content: praise.content,
            givenUserId: praise.givenUserId,
            receivedUserId: praise.receivedUserId,
            skillCodes: [skill.code],
            isApproved: true,
            createdAt: praise.createdAt.toISOString(),
            updatedAt: expect.any(String),
          });
        },
      });

      const updatedPraise = await prisma.praise.findUnique({
        where: { id: praise.id },
      });
      expect(updatedPraise?.isApproved).toBe(true);
    });
  });
});
