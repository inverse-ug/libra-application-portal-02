/*
  Warnings:

  - You are about to drop the column `workExperienceComplete` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the `WorkExperience` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "WorkExperience" DROP CONSTRAINT "WorkExperience_applicantId_fkey";

-- DropForeignKey
ALTER TABLE "WorkExperience" DROP CONSTRAINT "WorkExperience_applicationId_fkey";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "workExperienceComplete";

-- DropTable
DROP TABLE "WorkExperience";
