import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function getAuthenticatedUserId(
  req: NextRequest
): Promise<string> {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: true,
  });

  if (!token || !token.id) {
    throw new Error('Unauthorized');
  }

  return token.id;
}
