/*
  Warnings:

  - You are about to drop the column `type` on the `Program` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `Program` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Program" DROP COLUMN "type",
ADD COLUMN     "code" TEXT,
ADD COLUMN     "shortCourseDurationMonths" INTEGER NOT NULL DEFAULT 6;

-- DropEnum
DROP TYPE "ProgramType";

-- CreateIndex
CREATE UNIQUE INDEX "Program_code_key" ON "Program"("code");
