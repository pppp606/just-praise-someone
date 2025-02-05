import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { handleError, ErrorCode } from './errorHandler';

export async function getAuthenticatedUserId(
  req: NextRequest
): Promise<string> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.id) {
    throw handleError(ErrorCode.Unauthorized);
  }

  return token.id;
}
