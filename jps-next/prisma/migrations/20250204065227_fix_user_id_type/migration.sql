-- DropForeignKey
ALTER TABLE "llm_batch_jobs" DROP CONSTRAINT "llm_batch_jobs_userId_fkey";

-- AlterTable
ALTER TABLE "llm_batch_jobs" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "llm_batch_jobs" ADD CONSTRAINT "llm_batch_jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
