export const claimIdExample = 'cm9claimoffice0000000001';

export const createClaimExample = {
  claimNumber: 'CLM-100001',
  codeType: 'CPT',
  code: '99213',
  serviceDate: '2026-03-04',
  billedCents: 750_000,
} as const;

export const updateClaimExample = {
  billedCents: 12_800,
} as const;

export const claimResponseExample = {
  id: claimIdExample,
  claimNumber: createClaimExample.claimNumber,
  codeType: createClaimExample.codeType,
  code: createClaimExample.code,
  category: 'Evaluation and Management',
  description: 'Office visit, established patient, low complexity',
  serviceDate: '2026-03-04T00:00:00.000Z',
  billedCents: createClaimExample.billedCents,
  outcome: 'TRIGGERED',
  procedureFlag: 'PASSED',
  diagnosisFlag: 'PASSED',
  createdAt: '2026-11-09T16:00:00.000Z',
  updatedAt: '2026-11-09T16:00:00.000Z',
} as const;

export const claimPageExample = {
  rows: [claimResponseExample],
  rowCount: 1,
} as const;
