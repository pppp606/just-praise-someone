import { PrismaClient, Prisma, Praise } from '@prisma/client';
import { ErrorCode } from '../utils/errorHandler';

const prisma = new PrismaClient();

export const MIN_SKILL_COUNT = 1;
export const MAX_SKILL_COUNT = 3;
export const MIN_CONTENT_LENGTH = 10;
export const MAX_CONTENT_LENGTH = 127;
export const PAGE_SIZE = 10;

export interface PraiseIncludeSkillCode extends Praise {
  skillCodes: string[];
}

type PraiseWithSkills = Prisma.PraiseGetPayload<{
  include: {
    skills: {
      include: {
        skill: true;
      };
    };
  };
}>;

export class PraiseService {
  static prisma = prisma.praise;

  // 受け取った褒め言葉一覧
  static async getPraisesByReceivedUserId(
    receivedUserId: string,
    page?: number | undefined
  ) {
    const [praises, count] = await Promise.all([
      this.prisma.findMany({
        where: { receivedUserId },
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: page ? (page - 1) * PAGE_SIZE : undefined,
        take: PAGE_SIZE,
      }),
      this.prisma.count({
        where: { receivedUserId },
      }),
    ]);

    const totalPages = Math.ceil(count / PAGE_SIZE);

    return {
      items: praises ? praises.map(this.formatPraise) : [],
      count,
      totalPages,
    };
  }

  // 送った褒め言葉一覧
  static async getPraisesByGivenUserId(
    givenUserId: string,
    page?: number | undefined
  ) {
    const [praises, count] = await Promise.all([
      await this.prisma.findMany({
        where: { givenUserId },
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: page ? (page - 1) * PAGE_SIZE : undefined,
        take: PAGE_SIZE,
      }),
      this.prisma.count({
        where: { givenUserId },
      }),
    ]);

    const totalPages = Math.ceil(count / PAGE_SIZE);

    return {
      items: praises ? praises.map(this.formatPraise) : [],
      count,
      totalPages,
    };
  }

  static async getPraiseById(id: string) {
    const praise = await this.prisma.findUnique({
      where: { id },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!praise) {
      throw {
        code: ErrorCode.NotFound,
      };
    }

    return this.formatPraise(praise);
  }

  static async createPraise(data: {
    content: string;
    receivedUserId: string;
    skillCodes: string[];
    givenUserId: string;
  }) {
    this.validateContent(data.content);
    this.validateSkills(data.skillCodes);

    const skills = await prisma.skill.findMany({
      where: { code: { in: data.skillCodes } },
    });

    if (skills.length !== data.skillCodes.length) {
      throw {
        code: ErrorCode.NotFound,
      };
    }

    // 複製チェック
    const existingPraise = await this.prisma.findUnique({
      where: {
        givenUserId_receivedUserId: {
          givenUserId: data.givenUserId,
          receivedUserId: data.receivedUserId,
        },
      },
    });

    if (existingPraise) {
      throw {
        code: ErrorCode.DuplicateError,
      };
    }

    const newPraise = await this.prisma.create({
      data: {
        content: data.content,
        givenUserId: data.givenUserId,
        receivedUserId: data.receivedUserId,
        skills: {
          create: skills.map((skill) => ({
            skillId: skill.id,
          })),
        },
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    return this.formatPraise(newPraise);
  }

  // NOTE:投稿者 (givenUserId）　のみ削除可能
  static async deletePraise(id: string, givenUserId: string) {
    const praise = await this.prisma.findUnique({ where: { id, givenUserId } });

    if (!praise) {
      throw {
        code: ErrorCode.NotFound,
      };
    }

    return this.prisma.delete({ where: { id } });
  }

  // NOTE:投稿者 (givenUserId）　のみ更新可能
  static async updatePraise(
    id: string,
    givenUserId: string,
    data: { content: string; skillCodes: string[] }
  ) {
    const praise = await this.prisma.findUnique({ where: { id, givenUserId } });
    if (!praise) {
      throw {
        code: ErrorCode.NotFound,
      };
    }

    if (data.content) {
      this.validateContent(data.content);
    }

    if (data.skillCodes) {
      this.validateSkills(data.skillCodes);
    }

    const skills = await prisma.skill.findMany({
      where: { code: { in: data.skillCodes } },
    });

    if (skills.length !== data.skillCodes.length) {
      throw {
        code: ErrorCode.NotFound,
      };
    }

    const update = await this.prisma.update({
      where: { id },
      data: {
        content: data.content,
        skills: {
          deleteMany: {},
          create: skills.map((skill) => ({
            skillId: skill.id,
          })),
        },
        isApproved: false,
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    return this.formatPraise(update);
  }

  // NOTE: 受取人 (receivedUserId）　が isApproved のみ更新可能
  static async updateIsApproved(
    id: string,
    receivedUserId: string,
    isApproved: boolean
  ) {
    const praise = await this.prisma.findUnique({
      where: { id, receivedUserId },
    });
    if (!praise) {
      throw {
        code: ErrorCode.NotFound,
      };
    }

    const update = await this.prisma.update({
      where: { id },
      data: { isApproved },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    return this.formatPraise(update);
  }

  private static formatPraise(
    praise: PraiseWithSkills
  ): PraiseIncludeSkillCode {
    return {
      id: praise.id,
      content: praise.content,
      givenUserId: praise.givenUserId,
      receivedUserId: praise.receivedUserId,
      skillCodes: praise.skills.map((praiseSkill) => praiseSkill.skill.code),
      isApproved: praise.isApproved,
      createdAt: praise.createdAt,
      updatedAt: praise.updatedAt,
    };
  }

  private static validateContent(content: string) {
    if (
      content.length < MIN_CONTENT_LENGTH ||
      content.length >= MAX_CONTENT_LENGTH
    ) {
      throw {
        code: ErrorCode.ValidationError,
        message: `褒め言葉は${MIN_CONTENT_LENGTH}文字以上${MAX_CONTENT_LENGTH}文字以下で記入してください。`,
      };
    }
  }

  private static validateSkills(skillCodes: string[]) {
    if (
      skillCodes.length < MIN_SKILL_COUNT ||
      skillCodes.length >= MAX_SKILL_COUNT
    ) {
      throw {
        code: ErrorCode.ValidationError,
        message: `褒めスキルは${MIN_SKILL_COUNT}つ以上${MAX_SKILL_COUNT}つ以下で指定してください。`,
      };
    }
  }
}
