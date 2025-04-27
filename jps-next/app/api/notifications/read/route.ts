import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '../../../../services/notificationService';
import { getAuthenticatedUserId } from '../../../../utils/auth';
import { 
  handleError,
  handleServiceError,
  ErrorCode
} from '../../../../utils/errorHandler';

export async function PATCH(
  req: NextRequest,
) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return handleError(ErrorCode.NotFound);
    }

    await NotificationService.updateReadStatus(
      userId,
    );
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.log(error);
    return handleServiceError(error);
  }
}
