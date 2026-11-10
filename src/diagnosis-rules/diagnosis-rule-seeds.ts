export type DiagnosisRuleSeed = {
  name: string;
  description: string;
  code: string | null;
  category: string | null;
  laterality: string | null;
  requireHccEligible: boolean;
  enabled: boolean;
};

export const diagnosisRuleSeeds: readonly DiagnosisRuleSeed[] = [
  {
    name: 'Future HCC cost',
    description: 'Flag an HCC-eligible diagnosis. These conditions raise expected future cost.',
    code: null,
    category: null,
    laterality: null,
    requireHccEligible: true,
    enabled: true,
  },
  {
    name: 'Neoplasm watch',
    description: 'Flag a neoplasm or injury diagnosis for future high-cost care.',
    code: null,
    category: 'Neoplasms and Injury',
    laterality: null,
    requireHccEligible: false,
    enabled: true,
  },
  {
    name: 'Endocrine risk',
    description: 'Flag an endocrine diagnosis, including diabetes, for future cost.',
    code: null,
    category: 'Endocrine',
    laterality: null,
    requireHccEligible: false,
    enabled: true,
  },
];
