export const ruleIdExample = 'cm9rulehighdollar00000001';

export const createRuleExample = {
  name: 'High dollar claim',
  description: 'Any claim billed at $5,000 or more.',
  minFeeCents: 500_000,
  enabled: true,
} as const;

export const updateRuleExample = {
  minFeeCents: 600_000,
  enabled: false,
} as const;

export const ruleResponseExample = {
  id: ruleIdExample,
  ...createRuleExample,
  codeType: null,
  code: null,
  category: null,
  createdAt: '2026-11-09T16:00:00.000Z',
  updatedAt: '2026-11-09T16:00:00.000Z',
} as const;

export const rulePageExample = {
  rows: [ruleResponseExample],
  rowCount: 1,
} as const;
