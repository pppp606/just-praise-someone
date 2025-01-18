import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import { seed } from '../../prisma/seed';
import * as dotenv from 'dotenv';

const prisma = new PrismaClient();

module.exports = async () => {
  dotenv.config({ path: '.env.test', override: true });

  console.log('Global setup: Creating database...');
  execSync('npx prisma db push --force-reset', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL,
    },
  });

  await seed();
  await prisma.user.createMany({
    data: [
      {
        id: 'test_user_1',
        name: 'test_user_1',
        email: 'test1@example.com',
      },
      {
        id: 'test_user_2',
        name: 'test_user_2',
        email: 'test2@example.com',
      },
    ],
    skipDuplicates: true,
  });

  await prisma.account.createMany({
    data: [
      {
        userId: 'test_user_1',
        type: 'oauth',
        provider: 'github',
        providerAccountId: '12345',
        access_token: 'test_access_token_1',
        token_type: 'bearer',
      },
      {
        userId: 'test_user_2',
        type: 'oauth',
        provider: 'github',
        providerAccountId: '67890',
        access_token: 'test_access_token_2',
        token_type: 'bearer',
      },
    ],
  });

  await prisma.session.createMany({
    data: [
      {
        id: 'test_session_1',
        sessionToken: 'test_session_token_1',
        userId: 'test_user_1',
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
      {
        id: 'test_session_2',
        sessionToken: 'test_session_token_2',
        userId: 'test_user_2',
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    ],
  });

  console.log('Database created.');
};
