import { PraiseService } from '../../../services/praiseService';
import {
  ErrorCode,
  handleError,
  handleServiceError,
} from '../../../utils/errorHandler';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '../../../utils/auth';

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

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return handleError(ErrorCode.Unauthorized);
  }

  try {
    const data = await req.json();
    const { content, receivedUserId, skills } = data;

    if (!content || !receivedUserId) {
      return handleError(ErrorCode.ValidationError);
    }

    const newPraise = await PraiseService.createPraise({
      givenUserId: userId,
      receivedUserId,
      content,
      skillCodes: skills || [],
    });

    return NextResponse.json(newPraise, { status: 201 });
  } catch (error) {
    return handleServiceError(error);
  }
}
