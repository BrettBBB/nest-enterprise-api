export type ProcedureRuleCheck = {
  enabled: boolean;
  codeType: string | null;
  code: string | null;
  category: string | null;
  minStandardCost: number;
};

export type ProcedureRef = {
  code: string;
  codeType: string;
  category: string | null;
  standardCost: number | null;
};

export type DiagnosisRuleCheck = {
  enabled: boolean;
  code: string | null;
  category: string | null;
  laterality: string | null;
  requireHccEligible: boolean;
};

export type DiagnosisRef = {
  code: string;
  category: string | null;
  laterality: string | null;
  isHccEligible: boolean;
};

export type CodeFlag = 'TRIGGERED' | 'PASSED';

export function procedureFlag(
  claim: { codeType: string; code: string },
  procedure: ProcedureRef | null,
  rules: readonly ProcedureRuleCheck[],
): CodeFlag {
  if (!procedure || (claim.codeType !== 'CPT' && claim.codeType !== 'HCPCS')) {
    return 'PASSED';
  }
  if (procedure.code !== claim.code || procedure.codeType !== claim.codeType) {
    return 'PASSED';
  }

  const flagged = rules.some((rule) => {
    if (!rule.enabled || procedure.standardCost == null || procedure.standardCost < rule.minStandardCost) {
      return false;
    }
    if (rule.codeType && rule.codeType !== procedure.codeType) {
      return false;
    }
    if (rule.code && rule.code !== procedure.code) {
      return false;
    }
    if (rule.category && rule.category !== procedure.category) {
      return false;
    }
    return true;
  });
  return flagged ? 'TRIGGERED' : 'PASSED';
}

export function diagnosisFlag(
  claim: { codeType: string; code: string },
  diagnosis: DiagnosisRef | null,
  rules: readonly DiagnosisRuleCheck[],
): CodeFlag {
  if (!diagnosis || claim.codeType !== 'ICD10' || diagnosis.code !== claim.code) {
    return 'PASSED';
  }

  const flagged = rules.some((rule) => {
    if (!rule.enabled) {
      return false;
    }
    if (rule.requireHccEligible && !diagnosis.isHccEligible) {
      return false;
    }
    if (rule.code && rule.code !== diagnosis.code) {
      return false;
    }
    if (rule.category && rule.category !== diagnosis.category) {
      return false;
    }
    if (rule.laterality && rule.laterality !== diagnosis.laterality) {
      return false;
    }
    return true;
  });
  return flagged ? 'TRIGGERED' : 'PASSED';
}
