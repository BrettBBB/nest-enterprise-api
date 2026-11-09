-- CreateEnum
CREATE TYPE "ClaimOutcome" AS ENUM ('TRIGGERED', 'PASSED');

-- CreateTable
CREATE TABLE "claim_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "codeType" "MedicalCodeType",
    "code" TEXT,
    "category" TEXT,
    "minFeeCents" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "claim_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claims" (
    "id" TEXT NOT NULL,
    "claimNumber" TEXT NOT NULL,
    "medicalCodeId" TEXT NOT NULL,
    "codeType" "MedicalCodeType" NOT NULL,
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "serviceDate" DATE NOT NULL,
    "billedCents" INTEGER NOT NULL,
    "outcome" "ClaimOutcome" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "claims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "claim_rules_name_key" ON "claim_rules"("name");

-- CreateIndex
CREATE INDEX "claim_rules_enabled_idx" ON "claim_rules"("enabled");

-- CreateIndex
CREATE UNIQUE INDEX "claims_claimNumber_key" ON "claims"("claimNumber");

-- CreateIndex
CREATE INDEX "claims_outcome_idx" ON "claims"("outcome");

-- CreateIndex
CREATE INDEX "claims_billedCents_idx" ON "claims"("billedCents");

-- CreateIndex
CREATE INDEX "claims_codeType_idx" ON "claims"("codeType");

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_medicalCodeId_fkey" FOREIGN KEY ("medicalCodeId") REFERENCES "medical_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
