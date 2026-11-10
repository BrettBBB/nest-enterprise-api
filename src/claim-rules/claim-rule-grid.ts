import type { GridFields } from '../common/grid-query.js';
import { medicalCodeTypes } from '../common/code-types.js';

export const claimRuleGridFields = {
  name: 'string',
  description: 'string',
  codeType: 'enum',
  code: 'string',
  category: 'string',
  minFeeCents: 'number',
  enabled: 'boolean',
  createdAt: 'date',
  updatedAt: 'date',
} as const satisfies GridFields;

export const claimRuleEnumValues = {
  codeType: medicalCodeTypes,
} as const;

export const claimRuleQuickFilterFields = ['name', 'description', 'code', 'category'] as const;
