import { PrismaClient } from '@prisma/client';
import {
  ErrorCode,
  handleError,
  handleServiceError,
} from '../../../../utils/errorHandler';
import { NextRequest, NextResponse } from 'next/server';
import { UserResponse } from '../../../../types/response';
import { PutUserWithProfileRequest } from '../../../../types/request';
import { UserService } from '../../../../services/userService';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<UserResponse | Response> {
  const userId = (await params).id;
  const isCurrentUser = req.headers.get('user_id') === userId;

  if (!userId) {
    return handleError(ErrorCode.ValidationError);
  }

  try {
    const prisma = new PrismaClient();
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return handleError(ErrorCode.NotFound);
    }

    if (!isCurrentUser) {
      UserService.excludeDataNotCurrentUser(user);
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = (await params).id;
  if (!userId) {
    return handleError(ErrorCode.ValidationError);
  }

  const isCurrentUser = req.headers.get('user_id') === userId;
  if (!isCurrentUser) {
    return handleError(ErrorCode.Unauthorized);
  }

  try {
    const data = (await req.json()) as PutUserWithProfileRequest;
    const updatedUser = await UserService.updateUserWithProfile(userId, data);
    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = (await params).id;
  if (!userId) {
    return handleError(ErrorCode.ValidationError);
  }

  const isCurrentUser = req.headers.get('user_id') === userId;
  if (!isCurrentUser) {
    return handleError(ErrorCode.Unauthorized);
  }

  try {
    const prisma = new PrismaClient();
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
    return NextResponse.json(
      {
        message: 'Praise deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    return handleServiceError(error);
  }
}
