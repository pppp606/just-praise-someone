import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '../../../../../services/notificationService';
import { getAuthenticatedUserId } from '../../../../../utils/auth';
import { 
  handleError,
  handleServiceError,
  ErrorCode
} from '../../../../../utils/errorHandler';
import { PrismaClient } from '@prisma/client';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  if (!id) {
    return handleError(ErrorCode.NotFound);
  }

  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return handleError(ErrorCode.NotFound);
    }

    await NotificationService.updateReadStatus(
      id,
      userId,
    );
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.log(error);
    return handleServiceError(error);
  }
}
