import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// NOTE: データリセットから除外するテーブル
const excludeTables = ['skills', 'users', 'accounts', 'sessions'];

beforeEach(async () => {
  const excludeTablesList = excludeTables
    .map((table) => `'${table}'`)
    .join(', ');
  
  // 除外するテーブルのデータをバックアップ
  const backupData = {
    users: await prisma.user.findMany(),
    accounts: await prisma.account.findMany(),
    sessions: await prisma.session.findMany(),
    skills: await prisma.skill.findMany(),
  };
  
  await prisma.$queryRawUnsafe(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename NOT IN (${excludeTablesList})
  `);

  await prisma.$executeRawUnsafe(`
    DO $$
    DECLARE
      table_name TEXT;
    BEGIN
      FOR table_name IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename NOT IN (${excludeTablesList})
      LOOP
        EXECUTE format('TRUNCATE TABLE %I CASCADE;', table_name);
      END LOOP;
    END $$;
  `);

  // バックアップしたデータを復元
  await prisma.$transaction([
    prisma.user.deleteMany(),
    prisma.account.deleteMany(),
    prisma.session.deleteMany(),
    prisma.skill.deleteMany(),
    prisma.user.createMany({ data: backupData.users }),
    prisma.account.createMany({ data: backupData.accounts }),
    prisma.session.createMany({ data: backupData.sessions }),
    prisma.skill.createMany({ data: backupData.skills }),
  ]);
});
