import type { GridFields } from '../common/grid-query.js';

export const diagnosisCodeTypes = ['ICD-10-CM'] as const;

export const diagnosisCodeGridFields = {
  code: 'string',
  codeType: 'enum',
  category: 'string',
  shortDescription: 'string',
  longDescription: 'string',
  isBillable: 'boolean',
  requires7thCharacter: 'boolean',
  laterality: 'string',
  episodeOfCare: 'boolean',
  isHccEligible: 'boolean',
  effectiveDate: 'date',
  createdAt: 'date',
  updatedAt: 'date',
} as const satisfies GridFields;

export const diagnosisCodeEnumValues = {
  codeType: diagnosisCodeTypes,
} as const;

export const diagnosisCodeQuickFilterFields = [
  'code',
  'category',
  'shortDescription',
  'longDescription',
  'laterality',
] as const;
