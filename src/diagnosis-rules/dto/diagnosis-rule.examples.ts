export const createDiagnosisRuleExample = {
  name: 'Future HCC cost',
  description: 'Flag an HCC-eligible diagnosis. These conditions raise expected future cost.',
  requireHccEligible: true,
  enabled: true,
} as const;

export const updateDiagnosisRuleExample = {
  requireHccEligible: false,
  enabled: false,
} as const;

export const diagnosisRuleResponseExample = {
  id: 'cm9dxrulehcc000000000001',
  ...createDiagnosisRuleExample,
  code: null,
  category: null,
  laterality: null,
  createdAt: '2026-11-09T16:00:00.000Z',
  updatedAt: '2026-11-09T16:00:00.000Z',
} as const;

export const diagnosisRulePageExample = {
  rows: [diagnosisRuleResponseExample],
  rowCount: 1,
} as const;
