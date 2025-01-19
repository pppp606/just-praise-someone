import {
  ErrorCode,
  handleError,
  handleServiceError,
} from '../../../../../utils/errorHandler';
import { GithubEventService } from '../../../../../services/githubEventService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const userId = params?.userId;

  if (!userId) {
    return handleError(ErrorCode.NotFound);
  }

  try {
    const praise = await GithubEventService.getUserPublicEvents(userId);
    return NextResponse.json(praise, { status: 200 });
  } catch (error) {
    return handleServiceError(error);
  }
}
