-- CreateTable
CREATE TABLE "procedure_codes" (
    "code" VARCHAR(10) NOT NULL,
    "codeType" VARCHAR(10) NOT NULL,
    "category" VARCHAR(100),
    "shortDescription" TEXT NOT NULL,
    "longDescription" TEXT NOT NULL,
    "workRvu" DECIMAL(6,2),
    "peRvu" DECIMAL(6,2),
    "mpRvu" DECIMAL(6,2),
    "totalRvu" DECIMAL(6,2),
    "standardCost" DECIMAL(10,2),
    "effectiveDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procedure_codes_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "diagnosis_codes" (
    "code" VARCHAR(10) NOT NULL,
    "codeType" VARCHAR(10) NOT NULL,
    "category" VARCHAR(100),
    "shortDescription" TEXT NOT NULL,
    "longDescription" TEXT NOT NULL,
    "isBillable" BOOLEAN NOT NULL DEFAULT true,
    "requires7thCharacter" BOOLEAN NOT NULL DEFAULT false,
    "laterality" VARCHAR(20),
    "episodeOfCare" BOOLEAN NOT NULL DEFAULT false,
    "isHccEligible" BOOLEAN NOT NULL DEFAULT false,
    "effectiveDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnosis_codes_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "procedure_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "codeType" VARCHAR(10),
    "code" VARCHAR(10),
    "category" VARCHAR(100),
    "minStandardCost" DECIMAL(10,2) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procedure_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnosis_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "code" VARCHAR(10),
    "category" VARCHAR(100),
    "laterality" VARCHAR(20),
    "requireHccEligible" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnosis_rules_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "claims" ADD COLUMN "procedureFlag" "ClaimOutcome" NOT NULL DEFAULT 'PASSED';
ALTER TABLE "claims" ADD COLUMN "diagnosisFlag" "ClaimOutcome" NOT NULL DEFAULT 'PASSED';

-- CreateIndex
CREATE INDEX "procedure_codes_codeType_idx" ON "procedure_codes"("codeType");
CREATE INDEX "diagnosis_codes_isHccEligible_idx" ON "diagnosis_codes"("isHccEligible");
CREATE UNIQUE INDEX "procedure_rules_name_key" ON "procedure_rules"("name");
CREATE INDEX "procedure_rules_enabled_idx" ON "procedure_rules"("enabled");
CREATE UNIQUE INDEX "diagnosis_rules_name_key" ON "diagnosis_rules"("name");
CREATE INDEX "diagnosis_rules_enabled_idx" ON "diagnosis_rules"("enabled");
CREATE INDEX "claims_procedureFlag_idx" ON "claims"("procedureFlag");
CREATE INDEX "claims_diagnosisFlag_idx" ON "claims"("diagnosisFlag");
