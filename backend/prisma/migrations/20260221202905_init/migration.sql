-- CreateEnum
CREATE TYPE "SymptomType" AS ENUM ('BREAST_PAIN', 'LUMP_DETECTED', 'SKIN_CHANGES', 'NIPPLE_DISCHARGE', 'SWELLING', 'FATIGUE', 'OTHER');

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "sex" TEXT NOT NULL,
    "contactInfo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Symptom" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "type" "SymptomType" NOT NULL,
    "severity" INTEGER NOT NULL,
    "dateOfOccurrence" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Symptom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Symptom_patientId_dateOfOccurrence_idx" ON "Symptom"("patientId", "dateOfOccurrence");

-- AddForeignKey
ALTER TABLE "Symptom" ADD CONSTRAINT "Symptom_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
