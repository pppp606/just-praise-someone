import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";
import { seed } from "../../prisma/seed";

const prisma = new PrismaClient();

module.exports = async () => {
  console.log("Global setup: Creating database...");
  execSync("npx prisma db push --force-reset", { stdio: "inherit" });

  await seed();
  await prisma.user.createMany({
    data: [
      {
        id: "test_user_1",
        name: "test_user_1",
        email: "test1@example.com",
      },
      {
        id: "test_user_2",
        name: "test_user_2",
        email: "test2@example.com",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Database created.");
};
