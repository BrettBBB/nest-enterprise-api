import type { GridFields } from '../common/grid-query.js';
import { procedureCodeTypes } from '../procedure-codes/procedure-code-grid.js';

export const procedureRuleGridFields = {
  name: 'string',
  description: 'string',
  codeType: 'enum',
  code: 'string',
  category: 'string',
  minStandardCost: 'decimal',
  enabled: 'boolean',
  createdAt: 'date',
  updatedAt: 'date',
} as const satisfies GridFields;

export const procedureRuleEnumValues = {
  codeType: procedureCodeTypes,
} as const;

export const procedureRuleQuickFilterFields = ['name', 'description', 'code', 'category'] as const;
