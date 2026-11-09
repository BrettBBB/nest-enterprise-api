export const diagnosisCodeExample = 'E11.9';

export const diagnosisCodeResponseExample = {
  code: diagnosisCodeExample,
  codeType: 'ICD-10-CM',
  category: 'Endocrine',
  shortDescription: 'Type 2 diabetes mellitus without complications',
  longDescription:
    'Type 2 diabetes mellitus without complications. ICD-10-CM E11.9 is grouped under Endocrine.',
  isBillable: true,
  requires7thCharacter: false,
  laterality: null,
  episodeOfCare: false,
  isHccEligible: true,
  effectiveDate: '2026-01-01T00:00:00.000Z',
  createdAt: '2026-11-09T16:00:00.000Z',
  updatedAt: '2026-11-09T16:00:00.000Z',
} as const;

export const diagnosisCategoriesExample = {
  categories: ['Endocrine', 'Neoplasms and Injury'],
} as const;

export const diagnosisCodePageExample = {
  rows: [diagnosisCodeResponseExample],
  rowCount: 1,
} as const;
