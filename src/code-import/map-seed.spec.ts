import { BadRequestException } from '@nestjs/common';
import { mapDiagnosisSeed, mapProcedureSeed } from './map-seed.js';

const procedure = {
  code: '10021',
  type: 'CPT',
  category: 'Evaluation and Management',
  short_description: 'Office visit',
  description: 'Office or other outpatient visit.',
  work_rvu: 2.8,
  pe_rvu: 2.63,
  mp_rvu: 0.314,
  total_rvu: 5.74,
  standard_cost: 229.34,
  effective_date: '2026-01-01',
};

describe('seed mappers', () => {
  it('maps a CPT row onto the procedure table and rounds RVUs to cents', () => {
    expect(mapProcedureSeed([procedure], 'cpt_seed.json', 'CPT')).toEqual([
      {
        code: '10021',
        codeType: 'CPT',
        category: 'Evaluation and Management',
        shortDescription: 'Office visit',
        longDescription: 'Office or other outpatient visit.',
        workRvu: 2.8,
        peRvu: 2.63,
        mpRvu: 0.31,
        totalRvu: 5.74,
        standardCost: 229.34,
        effectiveDate: new Date('2026-01-01T00:00:00.000Z'),
      },
    ]);
  });

  it('keeps the last copy when a procedure code is repeated', () => {
    const rows = mapProcedureSeed(
      [
        { ...procedure, code: 'A4012', type: 'HCPCS', standard_cost: 10, work_rvu: null },
        { ...procedure, code: 'A4012', type: 'HCPCS', standard_cost: 20, work_rvu: null },
      ],
      'hcpcs_seed.json',
      'HCPCS',
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]?.standardCost).toBe(20);
    expect(rows[0]?.workRvu).toBeNull();
  });

  it('maps an ICD-10 row onto the diagnosis table', () => {
    const [row] = mapDiagnosisSeed(
      [
        {
          code: 'E11.9',
          category: 'Endocrine, nutritional and metabolic diseases',
          short_description: 'Type 2 diabetes',
          description: 'Type 2 diabetes mellitus without complications.',
          is_billable: true,
          requires_7th_character: false,
          laterality: null,
          episode_of_care: false,
          hcc_eligible: true,
        },
      ],
      'icd10_seed.json',
    );

    expect(row).toMatchObject({
      code: 'E11.9',
      codeType: 'ICD-10-CM',
      longDescription: 'Type 2 diabetes mellitus without complications.',
      isBillable: true,
      requires7thCharacter: false,
      laterality: null,
      episodeOfCare: false,
      isHccEligible: true,
      effectiveDate: new Date('2026-01-01T00:00:00.000Z'),
    });
  });

  it('rejects a file that is not a list', () => {
    expect(() => mapProcedureSeed({}, 'cpt_seed.json', 'CPT')).toThrow(BadRequestException);
  });
});
