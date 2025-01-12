import { PraiseService } from '../../../services/praiseService';
import {
  ErrorCode,
  handleError,
  handleServiceError,
} from '../../../utils/errorHandler';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  const userId = searchParams.get('userId');
  const type = (searchParams.get('type') as 'received' | 'given') || 'received';
  const page = Number(searchParams.get('page')) || 1;

  if (!userId || !type) {
    return handleError(ErrorCode.ValidationError);
  }

  try {
    const praises =
      type === 'received'
        ? await PraiseService.getPraisesByReceivedUserId(userId, page || 1)
        : await PraiseService.getPraisesByGivenUserId(userId, page || 1);
    return new Response(JSON.stringify(praises), { status: 200 });
  } catch (error) {
    return handleServiceError(error);
  }
}
