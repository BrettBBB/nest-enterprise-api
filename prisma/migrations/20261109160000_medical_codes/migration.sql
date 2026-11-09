-- CreateEnum
CREATE TYPE "MedicalCodeType" AS ENUM ('CPT', 'ICD10', 'HCPCS');

-- CreateTable
CREATE TABLE "medical_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "codeType" "MedicalCodeType" NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "feeCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "medical_codes_codeType_code_key" ON "medical_codes"("codeType", "code");

-- CreateIndex
CREATE INDEX "medical_codes_category_idx" ON "medical_codes"("category");
