import jwt from 'jsonwebtoken';

export const generateToken = (userId: string): string => {
  return jwt.sign(
    { sub: userId, iat: Math.floor(Date.now() / 1000) },
    process.env.NEXTAUTH_SECRET as string,
    { expiresIn: '1h' }
  );
};
