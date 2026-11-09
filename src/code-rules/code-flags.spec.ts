import { diagnosisFlag, procedureFlag } from './code-flags.js';
import { diagnosisRuleCatalog } from '../diagnosis-rules/diagnosis-rule-catalog.js';
import { procedureRuleCatalog } from '../procedure-rules/procedure-rule-catalog.js';

describe('procedure and diagnosis flags', () => {
  it('flags a high-cost surgery and passes a routine office procedure', () => {
    expect(
      procedureFlag(
        { codeType: 'CPT', code: '33533' },
        { code: '33533', codeType: 'CPT', category: 'Surgery', standardCost: 82000 },
        procedureRuleCatalog,
      ),
    ).toBe('TRIGGERED');
    expect(
      procedureFlag(
        { codeType: 'CPT', code: '99213' },
        { code: '99213', codeType: 'CPT', category: 'Evaluation and Management', standardCost: 128 },
        procedureRuleCatalog,
      ),
    ).toBe('PASSED');
  });

  it('flags an HCC diagnosis and passes a code that is not a future high-cost condition', () => {
    expect(
      diagnosisFlag(
        { codeType: 'ICD10', code: 'E11.9' },
        { code: 'E11.9', category: 'Endocrine', laterality: null, isHccEligible: true },
        diagnosisRuleCatalog,
      ),
    ).toBe('TRIGGERED');
    expect(
      diagnosisFlag(
        { codeType: 'ICD10', code: 'M54.50' },
        { code: 'M54.50', category: 'Musculoskeletal', laterality: null, isHccEligible: false },
        diagnosisRuleCatalog,
      ),
    ).toBe('PASSED');
  });

  it('does not apply a procedure rule to a diagnosis claim', () => {
    expect(
      procedureFlag(
        { codeType: 'ICD10', code: 'E11.9' },
        { code: 'E11.9', codeType: 'ICD-10-CM', category: 'Endocrine', standardCost: 168 },
        procedureRuleCatalog,
      ),
    ).toBe('PASSED');
  });
});
