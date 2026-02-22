/*
  Warnings:

  - The `sex` column on the `Patient` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "sex",
ADD COLUMN     "sex" "Sex" NOT NULL DEFAULT 'OTHER';

-- CreateIndex
CREATE INDEX "Symptom_patientId_severity_idx" ON "Symptom"("patientId", "severity");

-- CreateIndex
CREATE INDEX "Symptom_patientId_type_idx" ON "Symptom"("patientId", "type");
