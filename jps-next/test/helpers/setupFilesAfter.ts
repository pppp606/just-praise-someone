import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// NOTE: データリセットから除外するテーブル
const excludeTables = ['skills', 'users', 'accounts', 'sessions'];

beforeEach(async () => {
  const excludeTablesList = excludeTables
    .map((table) => `'${table}'`)
    .join(', ');
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
});
