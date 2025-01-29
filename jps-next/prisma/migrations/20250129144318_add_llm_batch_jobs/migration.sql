-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('OPENAI', 'ANTHROPIC', 'GOOGLE');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('PRAISE');

-- CreateTable
CREATE TABLE "llm_batch_jobs" (
    "id" TEXT NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "provider" "Provider" NOT NULL,
    "jobId" TEXT NOT NULL,
    "jobType" "JobType" NOT NULL,
    "metadata" JSONB,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "response" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "llm_batch_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "llm_batch_jobs_jobId_key" ON "llm_batch_jobs"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "llm_batch_jobs_provider_jobId_key" ON "llm_batch_jobs"("provider", "jobId");

-- AddForeignKey
ALTER TABLE "llm_batch_jobs" ADD CONSTRAINT "llm_batch_jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
