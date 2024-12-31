/*
  Warnings:

  - You are about to alter the column `content` on the `Praise` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - A unique constraint covering the columns `[givenUserId,receivedUserId]` on the table `Praise` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[praiseId,skillId]` on the table `PraiseSkill` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Praise" ALTER COLUMN "content" SET DATA TYPE VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "Praise_givenUserId_receivedUserId_key" ON "Praise"("givenUserId", "receivedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "PraiseSkill_praiseId_skillId_key" ON "PraiseSkill"("praiseId", "skillId");
