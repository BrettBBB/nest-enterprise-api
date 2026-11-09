import type { GridFields } from '../common/grid-query.js';
import { medicalCodeTypes } from '../common/code-types.js';

export const claimOutcomes = ['TRIGGERED', 'PASSED'] as const;

export const claimGridFields = {
  claimNumber: 'string',
  codeType: 'enum',
  code: 'string',
  category: 'string',
  description: 'string',
  serviceDate: 'date',
  billedCents: 'number',
  outcome: 'enum',
  procedureFlag: 'enum',
  diagnosisFlag: 'enum',
  createdAt: 'date',
  updatedAt: 'date',
} as const satisfies GridFields;

export const claimEnumValues = {
  codeType: medicalCodeTypes,
  outcome: claimOutcomes,
  procedureFlag: claimOutcomes,
  diagnosisFlag: claimOutcomes,
} as const;

export const claimQuickFilterFields = ['claimNumber', 'code', 'description', 'category'] as const;
