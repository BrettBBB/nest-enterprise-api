-- AlterTable
ALTER TABLE "claims" DROP CONSTRAINT "claims_medicalCodeId_fkey";

-- AlterTable
ALTER TABLE "claims" DROP COLUMN "medicalCodeId";

-- DropTable
DROP TABLE "medical_codes";
