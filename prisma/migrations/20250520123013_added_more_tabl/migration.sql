/*
  Warnings:

  - You are about to drop the column `applicationStatus` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `middleName` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `program` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `surname` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `applicationEndDate` on the `Intake` table. All the data in the column will be lost.
  - You are about to drop the column `applicationStartDate` on the `Intake` table. All the data in the column will be lost.
  - You are about to drop the column `availablePrograms` on the `Intake` table. All the data in the column will be lost.
  - The `status` column on the `Payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `ProgramCategory` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[applicationId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `programId` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `Intake` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Intake` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Intake` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `method` on the `Payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('MTN', 'AIRTEL', 'BANK', 'CARD');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- DropForeignKey
ALTER TABLE "ProgramCategory" DROP CONSTRAINT "ProgramCategory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramCategory" DROP CONSTRAINT "ProgramCategory_programId_fkey";

-- AlterTable
ALTER TABLE "Applicant" DROP COLUMN "applicationStatus",
DROP COLUMN "firstName",
DROP COLUMN "middleName",
DROP COLUMN "program",
DROP COLUMN "surname",
ADD COLUMN     "name" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "programId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Intake" DROP COLUMN "applicationEndDate",
DROP COLUMN "applicationStartDate",
DROP COLUMN "availablePrograms",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "transactionId" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
DROP COLUMN "method",
ADD COLUMN     "method" "PaymentMethod" NOT NULL;

-- DropTable
DROP TABLE "ProgramCategory";

-- CreateTable
CREATE TABLE "_IntakeToProgram" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_IntakeToProgram_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProgramToCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProgramToCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_IntakeToProgram_B_index" ON "_IntakeToProgram"("B");

-- CreateIndex
CREATE INDEX "_ProgramToCategory_B_index" ON "_ProgramToCategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_applicationId_key" ON "Payment"("applicationId");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IntakeToProgram" ADD CONSTRAINT "_IntakeToProgram_A_fkey" FOREIGN KEY ("A") REFERENCES "Intake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IntakeToProgram" ADD CONSTRAINT "_IntakeToProgram_B_fkey" FOREIGN KEY ("B") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProgramToCategory" ADD CONSTRAINT "_ProgramToCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProgramToCategory" ADD CONSTRAINT "_ProgramToCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
