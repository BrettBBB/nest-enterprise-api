export const procedureCodeExample = '99213';

export const procedureCodeResponseExample = {
  code: procedureCodeExample,
  codeType: 'CPT',
  category: 'Evaluation and Management',
  shortDescription: 'Office visit, established patient, low complexity',
  longDescription:
    'Office visit, established patient, low complexity. CPT 99213 is priced from the catalog fee in Evaluation and Management.',
  workRvu: 1.93,
  peRvu: 1.7,
  mpRvu: 0.15,
  totalRvu: 3.78,
  standardCost: 128,
  effectiveDate: '2026-01-01T00:00:00.000Z',
  createdAt: '2026-11-09T16:00:00.000Z',
  updatedAt: '2026-11-09T16:00:00.000Z',
} as const;

export const procedureCategoriesExample = {
  categories: ['Evaluation and Management', 'Surgery'],
} as const;

export const procedureCodePageExample = {
  rows: [procedureCodeResponseExample],
  rowCount: 1,
} as const;
