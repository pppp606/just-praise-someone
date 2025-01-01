import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_PATHS = ['/api/auth'];

export async function middleware(req: NextRequest) {
  const { pathname } = new URL(req.url);

  // PUBLIC_PATHS 内のエンドポイントは認証をスキップ
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // JWT を取得
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    // 認証されていない場合は 401 Unauthorized を返す
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'], // `/api` 以下のエンドポイントに適用
};
