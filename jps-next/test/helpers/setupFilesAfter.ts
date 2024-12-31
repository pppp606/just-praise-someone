import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

// NOTE: データリセットから除外するマスターテーブル
const excludeTables = ["skill", "user"];

beforeEach(async () => {
  console.log("Resetting database tables...");

  const excludeTablesList = excludeTables.map((table) => `'${table}'`).join(", ");

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

  console.log("Database tables reset. Seeding...");
});
