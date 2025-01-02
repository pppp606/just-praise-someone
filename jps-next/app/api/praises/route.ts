import { PraiseService } from '../../../services/praiseService';
import {
  ErrorCode,
  handleError,
  handleServiceError,
} from '../../../utils/errorHandler';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const userId = req.headers.get('user-id');
  if (!userId) {
    return handleError(ErrorCode.NotFound);
  }

  try {
    const data = await req.json();
    const newPraise = await PraiseService.createPraise({
      ...data,
      givenUserId: userId,
    });

    return new Response(JSON.stringify(newPraise), { status: 201 });
  } catch (error) {
    console.log(error);
    return handleServiceError(error);
  }
}
