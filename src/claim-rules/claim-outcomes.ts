import type { PrismaService } from '../prisma/prisma.service.js';

export type ClaimRuleCheck = {
  enabled: boolean;
  codeType: string | null;
  code: string | null;
  category: string | null;
  minFeeCents: number;
};

export type ClaimCheck = {
  codeType: string;
  code: string;
  category: string;
  billedCents: number;
};

export function claimRuleMatches(rule: ClaimRuleCheck, claim: ClaimCheck): boolean {
  if (!rule.enabled || claim.billedCents < rule.minFeeCents) {
    return false;
  }
  if (rule.codeType && rule.codeType !== claim.codeType) {
    return false;
  }
  if (rule.code && rule.code !== claim.code) {
    return false;
  }
  if (rule.category && rule.category !== claim.category) {
    return false;
  }
  return true;
}

export function claimOutcome(claim: ClaimCheck, rules: readonly ClaimRuleCheck[]): 'TRIGGERED' | 'PASSED' {
  return rules.some((rule) => claimRuleMatches(rule, claim)) ? 'TRIGGERED' : 'PASSED';
}

export async function refreshClaimOutcomes(prisma: PrismaService): Promise<void> {
  const rules = await prisma.claimRule.findMany();
  const claims = await prisma.claim.findMany({
    select: {
      id: true,
      codeType: true,
      code: true,
      category: true,
      billedCents: true,
      outcome: true,
    },
  });

  for (const claim of claims) {
    const outcome = claimOutcome(claim, rules);
    if (outcome !== claim.outcome) {
      await prisma.claim.update({ where: { id: claim.id }, data: { outcome } });
    }
  }
}
