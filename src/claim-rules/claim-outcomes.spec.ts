import { claimOutcome, claimRuleMatches } from './claim-outcomes.js';
import { claimRuleSeeds } from './claim-rule-seeds.js';

const highDollar = claimRuleSeeds[0];

describe('claimOutcome', () => {
  it('triggers a high-dollar office claim and passes a small one', () => {
    const claim = {
      codeType: 'CPT',
      code: '99213',
      category: 'Evaluation and Management',
      billedCents: 750_000,
    };

    expect(claimRuleMatches(highDollar, claim)).toBe(true);
    expect(claimOutcome(claim, claimRuleSeeds)).toBe('TRIGGERED');
    expect(
      claimOutcome({ ...claim, billedCents: 12_800 }, claimRuleSeeds),
    ).toBe('PASSED');
  });

  it('ignores a disabled rule', () => {
    expect(
      claimRuleMatches({ ...highDollar, enabled: false }, {
        codeType: 'CPT',
        code: '99213',
        category: 'Evaluation and Management',
        billedCents: 750_000,
      }),
    ).toBe(false);
  });
});
