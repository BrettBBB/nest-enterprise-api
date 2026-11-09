import type { GridFields } from '../common/grid-query.js';

export const procedureCodeTypes = ['CPT', 'HCPCS'] as const;

export const procedureCodeGridFields = {
  code: 'string',
  codeType: 'enum',
  category: 'string',
  shortDescription: 'string',
  longDescription: 'string',
  workRvu: 'decimal',
  peRvu: 'decimal',
  mpRvu: 'decimal',
  totalRvu: 'decimal',
  standardCost: 'decimal',
  effectiveDate: 'date',
  createdAt: 'date',
  updatedAt: 'date',
} as const satisfies GridFields;

export const procedureCodeEnumValues = {
  codeType: procedureCodeTypes,
} as const;

export const procedureCodeQuickFilterFields = [
  'code',
  'category',
  'shortDescription',
  'longDescription',
] as const;
