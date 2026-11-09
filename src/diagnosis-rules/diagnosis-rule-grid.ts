import type { GridFields } from '../common/grid-query.js';

export const diagnosisRuleGridFields = {
  name: 'string',
  description: 'string',
  code: 'string',
  category: 'string',
  laterality: 'string',
  requireHccEligible: 'boolean',
  enabled: 'boolean',
  createdAt: 'date',
  updatedAt: 'date',
} as const satisfies GridFields;

export const diagnosisRuleQuickFilterFields = ['name', 'description', 'code', 'category', 'laterality'] as const;
