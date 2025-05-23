/*
  Warnings:

  - You are about to drop the column `emailVerified` on the `AdminUser` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `AdminUser` table. All the data in the column will be lost.
  - You are about to drop the column `lastLoginAt` on the `AdminUser` table. All the data in the column will be lost.
  - You are about to drop the column `loginAttempts` on the `AdminUser` table. All the data in the column will be lost.
  - The `role` column on the `AdminUser` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `AdminPasswordResetToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AdminSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AdminPasswordResetToken" DROP CONSTRAINT "AdminPasswordResetToken_email_fkey";

-- DropForeignKey
ALTER TABLE "AdminSession" DROP CONSTRAINT "AdminSession_adminUserId_fkey";

-- DropIndex
DROP INDEX "AdminUser_email_idx";

-- AlterTable
ALTER TABLE "AdminUser" DROP COLUMN "emailVerified",
DROP COLUMN "isActive",
DROP COLUMN "lastLoginAt",
DROP COLUMN "loginAttempts",
DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'admin';

-- DropTable
DROP TABLE "AdminPasswordResetToken";

-- DropTable
DROP TABLE "AdminSession";

-- DropEnum
DROP TYPE "AdminRole";
