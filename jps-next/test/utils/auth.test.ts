import { NextRequest } from 'next/server';
import { getAuthenticatedUserId } from '../../utils/auth';
import { getToken } from 'next-auth/jwt';

jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

const mockGetToken = getToken as jest.Mock;

describe('getAuthenticatedUserId', () => {
  let req: NextRequest;

  beforeEach(() => {
    req = new NextRequest('http://localhost/api/test');
  });

  it('JWT から userId を正しく取得できる', async () => {
    mockGetToken.mockResolvedValue({ id: 'test-user-123' });

    const userId = await getAuthenticatedUserId(req);
    expect(userId).toBe('test-user-123');
  });

  it('JWT がない場合は Unauthorized エラーを返す', async () => {
    mockGetToken.mockResolvedValue(null);

    await expect(getAuthenticatedUserId(req)).rejects.toThrow('Unauthorized');
  });

  it('JWT に userId が含まれていない場合は Unauthorized エラーを返す', async () => {
    mockGetToken.mockResolvedValue({});

    await expect(getAuthenticatedUserId(req)).rejects.toThrow('Unauthorized');
  });
});
