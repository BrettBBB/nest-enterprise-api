export const createProcedureRuleExample = {
  name: 'High cost procedure',
  description: 'Flag a procedure whose standard cost is $5,000 or more.',
  minStandardCost: 5000,
  enabled: true,
} as const;

export const updateProcedureRuleExample = {
  minStandardCost: 8000,
  enabled: false,
} as const;

export const procedureRuleResponseExample = {
  id: 'cm9procrulehighcost00001',
  ...createProcedureRuleExample,
  codeType: null,
  code: null,
  category: null,
  createdAt: '2026-11-09T16:00:00.000Z',
  updatedAt: '2026-11-09T16:00:00.000Z',
} as const;

export const procedureRulePageExample = {
  rows: [procedureRuleResponseExample],
  rowCount: 1,
} as const;
