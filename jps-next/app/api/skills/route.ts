import { PrismaClient } from '@prisma/client';
import { handleServiceError } from '../../../utils/errorHandler';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const prisma = new PrismaClient();
    const skills = await prisma.skill.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return new Response(
      JSON.stringify({
        items: skills,
      }),
      { status: 200 }
    );
  } catch (error) {
    return handleServiceError(error);
  }
}
