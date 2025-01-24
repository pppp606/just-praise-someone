/*
  Warnings:

  - You are about to drop the column `sns_links` on the `user_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_profiles" DROP COLUMN "sns_links",
ADD COLUMN     "snsLinks" JSONB;
