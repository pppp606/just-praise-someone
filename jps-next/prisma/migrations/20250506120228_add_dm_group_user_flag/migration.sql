-- AlterTable
ALTER TABLE "group_users" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPending" BOOLEAN NOT NULL DEFAULT false;
