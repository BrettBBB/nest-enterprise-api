import type { GridFields } from '../common/grid-query.js';
import { medicalCodeTypes } from '../common/code-types.js';

export const ruleGridFields = {
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

export const ruleEnumValues = {
  codeType: medicalCodeTypes,
} as const;

export const ruleQuickFilterFields = ['name', 'description', 'code', 'category'] as const;
