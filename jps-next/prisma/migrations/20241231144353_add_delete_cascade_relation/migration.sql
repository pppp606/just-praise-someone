-- DropForeignKey
ALTER TABLE "praise_skills" DROP CONSTRAINT "praise_skills_praiseId_fkey";

-- DropForeignKey
ALTER TABLE "praise_skills" DROP CONSTRAINT "praise_skills_skillId_fkey";

-- DropForeignKey
ALTER TABLE "user_profiles" DROP CONSTRAINT "user_profiles_userId_fkey";

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "praise_skills" ADD CONSTRAINT "praise_skills_praiseId_fkey" FOREIGN KEY ("praiseId") REFERENCES "praises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "praise_skills" ADD CONSTRAINT "praise_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
