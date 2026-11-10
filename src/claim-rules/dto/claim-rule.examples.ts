export const claimRuleIdExample = 'cm9rulehighdollar00000001';

export const createClaimRuleExample = {
  name: 'High dollar claim',
  description: 'Any claim billed at $5,000 or more.',
  minFeeCents: 500_000,
  enabled: true,
} as const;

export const updateClaimRuleExample = {
  minFeeCents: 600_000,
  enabled: false,
} as const;

export const claimRuleResponseExample = {
  id: claimRuleIdExample,
  ...createClaimRuleExample,
  codeType: null,
  code: null,
  category: null,
  createdAt: '2026-11-09T16:00:00.000Z',
  updatedAt: '2026-11-09T16:00:00.000Z',
} as const;

export const claimRulePageExample = {
  rows: [claimRuleResponseExample],
  rowCount: 1,
} as const;
