import { PrismaClient } from '@prisma/client';
import {
  PraiseService,
  MIN_CONTENT_LENGTH,
  MAX_CONTENT_LENGTH,
} from '../../services/praiseService';

describe('PraiseService', () => {
  describe('getPraisesByReceivedUserId', () => {
    test('受け取った褒め言葉が存在しない場合、空の配列を返す', async () => {
      const praises =
        await PraiseService.getPraisesByReceivedUserId('test_user_1');
      expect(praises).toEqual([]);
    });

    test('受け取った褒め言葉が存在する場合、褒め言葉一覧を返す', async () => {
      const prisma = new PrismaClient();
      const skill = await prisma.skill.findFirst({
        where: { code: 'code_quality' },
      });
      if (!skill) {
        throw new Error('Skill not found');
      }

      await prisma.praise.create({
        data: {
          content: 'a'.repeat(MIN_CONTENT_LENGTH),
          receivedUserId: 'test_user_1',
          skills: {
            create: [{ skillId: skill.id }],
          },
          givenUserId: 'test_user_2',
        },
      });

      const praises =
        await PraiseService.getPraisesByReceivedUserId('test_user_1');
      expect(praises).toHaveLength(1);
      expect(praises[0].receivedUserId).toBe('test_user_1');
    });
  });

  describe('getPraisesByGivenUserId', () => {
    test('送った褒め言葉が存在しない場合、空の配列を返す', async () => {
      const praises =
        await PraiseService.getPraisesByGivenUserId('test_user_1');
      expect(praises).toEqual([]);
    });

    test('送った褒め言葉が存在する場合、褒め言葉一覧を返す', async () => {
      const prisma = new PrismaClient();
      const skill = await prisma.skill.findFirst({
        where: { code: 'code_quality' },
      });
      if (!skill) {
        throw new Error('Skill not found');
      }

      await prisma.praise.create({
        data: {
          content: 'a'.repeat(MIN_CONTENT_LENGTH),
          receivedUserId: 'test_user_1',
          skills: {
            create: [{ skillId: skill.id }],
          },
          givenUserId: 'test_user_2',
        },
      });

      const praises =
        await PraiseService.getPraisesByGivenUserId('test_user_2');
      expect(praises).toHaveLength(1);
      expect(praises[0].givenUserId).toBe('test_user_2');
    });
  });

  describe('getPraiseById', () => {
    test('存在しない褒め言葉を取得しようとした場合、NotFoundErrorを返す', async () => {
      const praiseId = 'invalid_praise_id';
      await expect(PraiseService.getPraiseById(praiseId)).rejects.toEqual({
        code: 'notFound',
      });
    });

    test('褒め言葉が存在する場合、褒め言葉を返す', async () => {
      const prisma = new PrismaClient();
      const skill = await prisma.skill.findFirst({
        where: { code: 'code_quality' },
      });
      if (!skill) {
        throw new Error('Skill not found');
      }
      const createdPraise = await prisma.praise.create({
        data: {
          content: 'a'.repeat(MIN_CONTENT_LENGTH),
          receivedUserId: 'test_user_1',
          skills: {
            create: [{ skillId: skill.id }],
          },
          givenUserId: 'test_user_2',
        },
      });

      const praise = await PraiseService.getPraiseById(createdPraise.id);
      expect(praise.id).toBe(createdPraise.id);
    });
  });

  describe('createPraise', () => {
    test('褒め言葉がMIN_CONTENT_LENGTH未満の場合、ValidationErrorを返す', async () => {
      const data = {
        content: 'a'.repeat(MIN_CONTENT_LENGTH - 1),
        receivedUserId: 'test_user_1',
        skillCodes: ['code_quality'],
        givenUserId: 'test_user_2',
      };

      await expect(PraiseService.createPraise(data)).rejects.toEqual({
        code: 'validationError',
        message: `褒め言葉は${MIN_CONTENT_LENGTH}文字以上${MAX_CONTENT_LENGTH}文字以下で記入してください。`,
      });
    });

    test('褒め言葉がMAX_CONTENT_LENGTHを超える場合、ValidationErrorを返す', async () => {
      const data = {
        content: 'a'.repeat(MAX_CONTENT_LENGTH),
        receivedUserId: 'test_user_1',
        skillCodes: ['code_quality'],
        givenUserId: 'test_user_2',
      };

      await expect(PraiseService.createPraise(data)).rejects.toEqual({
        code: 'validationError',
        message: `褒め言葉は${MIN_CONTENT_LENGTH}文字以上${MAX_CONTENT_LENGTH}文字以下で記入してください。`,
      });
    });

    test('skillCodesがMIN_SKILL_COUNT未満の場合、ValidationErrorを返す', async () => {
      const data = {
        content: 'a'.repeat(MIN_CONTENT_LENGTH),
        receivedUserId: 'test_user_1',
        skillCodes: [],
        givenUserId: 'test_user_2',
      };

      await expect(PraiseService.createPraise(data)).rejects.toEqual({
        code: 'validationError',
        message: `褒めスキルは1つ以上3つ以下で指定してください。`,
      });
    });

    test('skillCodesがMAX_SKILL_COUNTを超える場合、ValidationErrorを返す', async () => {
      const data = {
        content: 'a'.repeat(MIN_CONTENT_LENGTH),
        receivedUserId: 'test_user_1',
        skillCodes: [
          'code_quality',
          'debugging',
          'code_review',
          'security',
          'hacking',
        ],
        givenUserId: 'test_user_2',
      };

      await expect(PraiseService.createPraise(data)).rejects.toEqual({
        code: 'validationError',
        message: `褒めスキルは1つ以上3つ以下で指定してください。`,
      });
    });

    test('指定されたスキルが存在しない場合、NotFoundErrorを返す', async () => {
      const data = {
        content: 'a'.repeat(MIN_CONTENT_LENGTH),
        receivedUserId: 'test_user_1',
        skillCodes: ['invalid_skill_code'],
        givenUserId: 'test_user_2',
      };

      await expect(PraiseService.createPraise(data)).rejects.toEqual({
        code: 'notFound',
      });
    });

    test('同じユーザーに対する褒め言葉が既に存在する場合、DuplicateErrorを返す', async () => {
      const prisma = new PrismaClient();
      const skill = await prisma.skill.findFirst({
        where: { code: 'code_quality' },
      });
      if (!skill) {
        throw new Error('Skill not found');
      }
      await prisma.praise.create({
        data: {
          content: 'a'.repeat(MIN_CONTENT_LENGTH),
          receivedUserId: 'test_user_1',
          skills: {
            create: [{ skillId: skill.id }],
          },
          givenUserId: 'test_user_2',
        },
      });

      const data = {
        content: 'a'.repeat(MIN_CONTENT_LENGTH),
        receivedUserId: 'test_user_1',
        skillCodes: ['code_quality'],
        givenUserId: 'test_user_2',
      };

      await expect(PraiseService.createPraise(data)).rejects.toEqual({
        code: 'duplicateError',
      });
    });

    test('正常なデータの場合、褒め言葉を作成する', async () => {
      const data = {
        content: 'a'.repeat(MIN_CONTENT_LENGTH),
        receivedUserId: 'test_user_1',
        skillCodes: ['code_quality'],
        givenUserId: 'test_user_2',
      };

      const createdPraise = await PraiseService.createPraise(data);

      expect(createdPraise.receivedUserId).toBe(data.receivedUserId);
      expect(createdPraise.skillCodes).toEqual(data.skillCodes);
      expect(createdPraise.givenUserId).toBe(data.givenUserId);
      expect(createdPraise.receivedUserId).toBe(data.receivedUserId);
      expect(createdPraise.isApproved).toBe(false);
    });
  });

  describe('deletePraise', () => {
    test('存在しない褒め言葉を削除しようとした場合、NotFoundErrorを返す', async () => {
      const praiseId = 'invalid_praise_id';
      await expect(
        PraiseService.deletePraise(praiseId, 'test_user_1')
      ).rejects.toEqual({
        code: 'notFound',
      });
    });

    test('投稿者以外が褒め言葉を削除しようとした場合、NotFoundErrorを返す', async () => {
      const prisma = new PrismaClient();
      const skill = await prisma.skill.findFirst({
        where: { code: 'code_quality' },
      });
      if (!skill) {
        throw new Error('Skill not found');
      }
      const createdPraise = await prisma.praise.create({
        data: {
          content: 'a'.repeat(MIN_CONTENT_LENGTH),
          receivedUserId: 'test_user_1',
          skills: {
            create: [{ skillId: skill.id }],
          },
          givenUserId: 'test_user_2',
        },
      });

      await expect(
        PraiseService.deletePraise(createdPraise.id, 'test_user_1')
      ).rejects.toEqual({
        code: 'notFound',
      });

      const praise = await prisma.praise.findUnique({
        where: { id: createdPraise.id },
      });
      expect(praise).not.toBeNull();
    });

    test('正常なデータの場合、褒め言葉を削除する', async () => {
      const prisma = new PrismaClient();
      const skill = await prisma.skill.findFirst({
        where: { code: 'code_quality' },
      });
      if (!skill) {
        throw new Error('Skill not found');
      }
      const createdPraise = await prisma.praise.create({
        data: {
          content: 'a'.repeat(MIN_CONTENT_LENGTH),
          receivedUserId: 'test_user_1',
          skills: {
            create: [{ skillId: skill.id }],
          },
          givenUserId: 'test_user_2',
        },
      });

      await PraiseService.deletePraise(createdPraise.id, 'test_user_2');

      const deletedPraise = await prisma.praise.findUnique({
        where: { id: createdPraise.id },
      });
      expect(deletedPraise).toBeNull();

      const deletedSkill = await prisma.praiseSkill.findFirst({
        where: { praiseId: createdPraise.id },
      });
      expect(deletedSkill).toBeNull();
    });
  });

  describe('updatePraise', () => {
    test('存在しない褒め言葉を更新しようとした場合、NotFoundErrorを返す', async () => {
      const praiseId = 'invalid_praise_id';
      await expect(
        PraiseService.updatePraise(praiseId, 'test_user_1', {
          content: 'a'.repeat(MIN_CONTENT_LENGTH),
          skillCodes: ['code_quality'],
        })
      ).rejects.toEqual({
        code: 'notFound',
      });
    });

    test('投稿者以外が褒め言葉を更新しようとした場合、UnauthorizedErrorを返す', async () => {
      const prisma = new PrismaClient();
      const skill = await prisma.skill.findFirst({
        where: { code: 'code_quality' },
      });
      if (!skill) {
        throw new Error('Skill not found');
      }
      const createdPraise = await prisma.praise.create({
        data: {
          content: 'a'.repeat(MIN_CONTENT_LENGTH),
          receivedUserId: 'test_user_1',
          skills: {
            create: [{ skillId: skill.id }],
          },
          givenUserId: 'test_user_2',
        },
      });

      await expect(
        PraiseService.updatePraise(createdPraise.id, 'test_user_1', {
          content: 'a'.repeat(MIN_CONTENT_LENGTH),
          skillCodes: ['code_quality'],
        })
      ).rejects.toEqual({
        code: 'unauthorized',
      });

      const praise = await prisma.praise.findUnique({
        where: { id: createdPraise.id },
      });
      expect(praise).not.toBeNull();
    });

    test('contentがMIN_CONTENT_LENGTH未満の場合、ValidationErrorを返す', async () => {
      const prisma = new PrismaClient();
      const skill = await prisma.skill.findFirst({
        where: { code: 'code_quality' },
      });
      if (!skill) {
        throw new Error('Skill not found');
      }
      const createdPraise = await prisma.praise.create({
        data: {
          content: 'a'.repeat(MIN_CONTENT_LENGTH),
          receivedUserId: 'test_user_1',
          skills: {
            create: [{ skillId: skill.id }],
          },
          givenUserId: 'test_user_2',
        },
      });

      const data = {
        content: 'a'.repeat(MIN_CONTENT_LENGTH - 1),
        skillCodes: ['code_quality'],
      };

      await expect(
        PraiseService.updatePraise(createdPraise.id, 'test_user_2', data)
      ).rejects.toEqual({
        code: 'validationError',
        message: `褒め言葉は${MIN_CONTENT_LENGTH}文字以上${MAX_CONTENT_LENGTH}文字以下で記入してください。`,
      });
    });

    test('contentがMAX_CONTENT_LENGTHを超える場合、ValidationErrorを返す', async () => {
      const prisma = new PrismaClient();
      const skill = await prisma.skill.findFirst({
        where: { code: 'code_quality' },
      });
      if (!skill) {
        throw new Error('Skill not found');
      }
      const createdPraise = await prisma.praise.create({
        data: {
          content: 'a'.repeat(MIN_CONTENT_LENGTH),
          receivedUserId: 'test_user_1',
          skills: {
            create: [{ skillId: skill.id }],
          },
          givenUserId: 'test_user_2',
        },
      });

      const data = {
        content: 'a'.repeat(MAX_CONTENT_LENGTH),
        skillCodes: ['code_quality'],
      };

      await expect(
        PraiseService.updatePraise(createdPraise.id, 'test_user_2', data)
      ).rejects.toEqual({
        code: 'validationError',
        message: `褒め言葉は${MIN_CONTENT_LENGTH}文字以上${MAX_CONTENT_LENGTH}文字以下で記入してください。`,
      });
    });

    test('skillCodesがMIN_SKILL_COUNT未満の場合、ValidationErrorを返す', async () => {
      const prisma = new PrismaClient();
      const skill = await prisma.skill.findFirst({
        where: { code: 'code_quality' },
      });
      if (!skill) {
        throw new Error('Skill not found');
      }
      const createdPraise = await prisma.praise.create({
        data: {
          content: 'a'.repeat(MIN_CONTENT_LENGTH),
          receivedUserId: 'test_user_1',
          skills: {
            create: [{ skillId: skill.id }],
          },
          givenUserId: 'test_user_2',
        },
      });

      const data = {
        content: 'a'.repeat(MIN_CONTENT_LENGTH),
        skillCodes: [],
      };

      await expect(
        PraiseService.updatePraise(createdPraise.id, 'test_user_2', data)
      ).rejects.toEqual({
        code: 'validationError',
        message: `褒めスキルは1つ以上3つ以下で指定してください。`,
      });
    });

    test('skillCodesがMAX_SKILL_COUNTを超える場合、ValidationErrorを返す', async () => {
      const prisma = new PrismaClient();
      const skill = await prisma.skill.findFirst({
        where: { code: 'code_quality' },
      });
      if (!skill) {
        throw new Error('Skill not found');
      }
      const createdPraise = await prisma.praise.create({
        data: {
          content: 'a'.repeat(MIN_CONTENT_LENGTH),
          receivedUserId: 'test_user_1',
          skills: {
            create: [{ skillId: skill.id }],
          },
          givenUserId: 'test_user_2',
        },
      });

      const data = {
        content: 'a'.repeat(MIN_CONTENT_LENGTH),
        skillCodes: [
          'code_quality',
          'debugging',
          'code_review',
          'security',
          'hacking',
        ],
      };

      await expect(
        PraiseService.updatePraise(createdPraise.id, 'test_user_2', data)
      ).rejects.toEqual({
        code: 'validationError',
        message: `褒めスキルは1つ以上3つ以下で指定してください。`,
      });
    });
  });

  describe('updateIsApproved', () => {
    test('存在しない褒め言葉を更新しようとした場合、NotFoundErrorを返す', async () => {
      const praiseId = 'invalid_praise_id';
      await expect(
        PraiseService.updateIsApproved(praiseId, 'test_user_1', true)
      ).rejects.toEqual({
        code: 'notFound',
      });
    });

    test('受取人以外がisApprovedを更新しようとした場合、UnauthorizedErrorを返す', async () => {
      const prisma = new PrismaClient();
      const skill = await prisma.skill.findFirst({
        where: { code: 'code_quality' },
      });
      if (!skill) {
        throw new Error('Skill not found');
      }
      const createdPraise = await prisma.praise.create({
        data: {
          content: 'a'.repeat(MIN_CONTENT_LENGTH),
          receivedUserId: 'test_user_1',
          skills: {
            create: [{ skillId: skill.id }],
          },
          givenUserId: 'test_user_2',
        },
      });

      await expect(
        PraiseService.updateIsApproved(createdPraise.id, 'test_user_2', true)
      ).rejects.toEqual({
        code: 'unauthorized',
      });

      const praise = await prisma.praise.findUnique({
        where: { id: createdPraise.id },
      });
      expect(praise).not.toBeNull();
    });

    test('正常なデータの場合、isApprovedを更新する', async () => {
      const prisma = new PrismaClient();
      const skill = await prisma.skill.findFirst({
        where: { code: 'code_quality' },
      });
      if (!skill) {
        throw new Error('Skill not found');
      }
      const createdPraise = await prisma.praise.create({
        data: {
          content: 'a'.repeat(MIN_CONTENT_LENGTH),
          receivedUserId: 'test_user_1',
          skills: {
            create: [{ skillId: skill.id }],
          },
          givenUserId: 'test_user_2',
        },
      });

      await PraiseService.updateIsApproved(
        createdPraise.id,
        'test_user_1',
        true
      );

      const updatedPraise = await prisma.praise.findUnique({
        where: { id: createdPraise.id },
      });
      expect(updatedPraise?.isApproved).toBe(true);
    });
  });
});
