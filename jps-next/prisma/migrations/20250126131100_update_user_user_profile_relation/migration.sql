/*
  Warnings:

  - You are about to drop the column `userId` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userProfileId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `providerAccountId` to the `user_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `providerUserId` to the `user_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user_profiles" DROP CONSTRAINT "user_profiles_userId_fkey";

-- DropIndex
DROP INDEX "user_profiles_userId_key";

-- AlterTable
ALTER TABLE "user_profiles" DROP COLUMN "userId",
ADD COLUMN     "image" TEXT,
ADD COLUMN     "providerAccountId" TEXT NOT NULL,
ADD COLUMN     "providerUserId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "image",
ADD COLUMN     "userProfileId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_userProfileId_key" ON "users"("userProfileId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
