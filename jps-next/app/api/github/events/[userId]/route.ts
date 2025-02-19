import {
  ErrorCode,
  handleError,
  handleServiceError,
} from '../../../../../utils/errorHandler';
import { GithubEventService } from '../../../../../services/githubEventService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const userId = (await params).userId;

  if (!userId) {
    return handleError(ErrorCode.NotFound);
  }

  try {
    const praise = await GithubEventService.getUserPublicEvents(userId, 60);
    return NextResponse.json(praise, { status: 200 });
  } catch (error) {
    return handleServiceError(error);
  }
}
