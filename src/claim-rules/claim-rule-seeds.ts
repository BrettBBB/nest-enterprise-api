import type { MedicalCodeTypeName } from '../common/code-types.js';

export type ClaimRuleSeed = {
  name: string;
  description: string;
  codeType: MedicalCodeTypeName | null;
  code: string | null;
  category: string | null;
  minFeeCents: number;
  enabled: boolean;
};

export const claimRuleSeeds: readonly ClaimRuleSeed[] = [
  {
    name: 'High dollar claim',
    description: 'Any claim billed at $5,000 or more.',
    codeType: null,
    code: null,
    category: null,
    minFeeCents: 500_000,
    enabled: true,
  },
  {
    name: 'Surgery outlier',
    description: 'A surgery claim billed at $2,500 or more.',
    codeType: 'CPT',
    code: null,
    category: 'Surgery',
    minFeeCents: 250_000,
    enabled: true,
  },
  {
    name: 'Radiology outlier',
    description: 'A radiology claim billed at $1,500 or more.',
    codeType: 'CPT',
    code: null,
    category: 'Radiology',
    minFeeCents: 150_000,
    enabled: true,
  },
  {
    name: 'Drug spend',
    description: 'A drug or injection claim billed at $1,000 or more.',
    codeType: 'HCPCS',
    code: null,
    category: 'Drugs and Injections',
    minFeeCents: 100_000,
    enabled: true,
  },
  {
    name: 'Bypass graft review',
    description: 'CPT 33533 billed at $20,000 or more.',
    codeType: 'CPT',
    code: '33533',
    category: null,
    minFeeCents: 2_000_000,
    enabled: true,
  },
];
