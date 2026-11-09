import type { DiagnosisCode, ProcedureCode } from '../../generated/prisma/client.js';
import { decimalToNumber } from '../common/decimals.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { diagnosisFlag, procedureFlag } from './code-flags.js';

type FlagClient = Pick<PrismaService, 'claim' | 'procedureCode' | 'diagnosisCode' | 'procedureRule' | 'diagnosisRule'>;

export async function flagsForClaim(prisma: FlagClient, claim: { codeType: string; code: string }) {
  const [procedureRules, diagnosisRules, procedure, diagnosis] = await Promise.all([
    prisma.procedureRule.findMany(),
    prisma.diagnosisRule.findMany(),
    prisma.procedureCode.findUnique({ where: { code: claim.code } }),
    prisma.diagnosisCode.findUnique({ where: { code: claim.code } }),
  ]);
  return score(claim, procedure, diagnosis, procedureRules, diagnosisRules);
}

export async function refreshCodeFlags(prisma: FlagClient) {
  const [claims, procedures, diagnoses, procedureRules, diagnosisRules] = await Promise.all([
    prisma.claim.findMany({
      select: { id: true, codeType: true, code: true, procedureFlag: true, diagnosisFlag: true },
    }),
    prisma.procedureCode.findMany(),
    prisma.diagnosisCode.findMany(),
    prisma.procedureRule.findMany(),
    prisma.diagnosisRule.findMany(),
  ]);
  const procedureByCode = new Map(procedures.map((row) => [row.code, row]));
  const diagnosisByCode = new Map(diagnoses.map((row) => [row.code, row]));

  for (const claim of claims) {
    const next = score(
      claim,
      procedureByCode.get(claim.code) ?? null,
      diagnosisByCode.get(claim.code) ?? null,
      procedureRules,
      diagnosisRules,
    );
    if (next.procedureFlag === claim.procedureFlag && next.diagnosisFlag === claim.diagnosisFlag) {
      continue;
    }
    await prisma.claim.update({ where: { id: claim.id }, data: next });
  }
}

function score(
  claim: { codeType: string; code: string },
  procedure: ProcedureCode | null,
  diagnosis: DiagnosisCode | null,
  procedureRules: readonly { enabled: boolean; codeType: string | null; code: string | null; category: string | null; minStandardCost: unknown }[],
  diagnosisRules: readonly { enabled: boolean; code: string | null; category: string | null; laterality: string | null; requireHccEligible: boolean }[],
) {
  return {
    procedureFlag: procedureFlag(
      claim,
      procedure
        ? {
            code: procedure.code,
            codeType: procedure.codeType,
            category: procedure.category,
            standardCost: decimalToNumber(procedure.standardCost),
          }
        : null,
      procedureRules.map((rule) => ({
        enabled: rule.enabled,
        codeType: rule.codeType,
        code: rule.code,
        category: rule.category,
        minStandardCost: decimalToNumber(rule.minStandardCost) ?? 0,
      })),
    ),
    diagnosisFlag: diagnosisFlag(
      claim,
      diagnosis
        ? {
            code: diagnosis.code,
            category: diagnosis.category,
            laterality: diagnosis.laterality,
            isHccEligible: diagnosis.isHccEligible,
          }
        : null,
      diagnosisRules,
    ),
  };
}
