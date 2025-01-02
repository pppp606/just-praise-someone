import { middleware } from '../middleware';
import { NextRequest } from 'next/server';

test('Middleware is applied to all API routes', async () => {
  const routes = ['/api/praise'];

  for (const route of routes) {
    const req = new NextRequest(`http://localhost${route}`, {
      headers: new Headers({}),
    });

    const res = await middleware(req);

    expect(res?.status).toBe(401); // 未認証でアクセスすると 401 が返る
  }
});
