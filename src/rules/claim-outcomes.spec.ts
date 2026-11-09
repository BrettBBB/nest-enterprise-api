import { claimOutcome, ruleMatches } from './claim-outcomes.js';
import { ruleCatalog } from './rule-catalog.js';

const highDollar = ruleCatalog[0];

describe('claimOutcome', () => {
  it('triggers a high-dollar office claim and passes a small one', () => {
    const claim = {
      codeType: 'CPT',
      code: '99213',
      category: 'Evaluation and Management',
      billedCents: 750_000,
    };

    expect(ruleMatches(highDollar, claim)).toBe(true);
    expect(claimOutcome(claim, ruleCatalog)).toBe('TRIGGERED');
    expect(
      claimOutcome({ ...claim, billedCents: 12_800 }, ruleCatalog),
    ).toBe('PASSED');
  });

  it('ignores a disabled rule', () => {
    expect(
      ruleMatches({ ...highDollar, enabled: false }, {
        codeType: 'CPT',
        code: '99213',
        category: 'Evaluation and Management',
        billedCents: 750_000,
      }),
    ).toBe(false);
  });
});
