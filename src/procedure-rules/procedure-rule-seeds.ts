export type ProcedureRuleSeed = {
  name: string;
  description: string;
  codeType: string | null;
  code: string | null;
  category: string | null;
  minStandardCost: number;
  enabled: boolean;
};

export const procedureRuleCatalog: readonly ProcedureRuleSeed[] = [
  {
    name: 'High cost procedure',
    description: 'Flag a procedure whose standard cost is $5,000 or more.',
    codeType: null,
    code: null,
    category: null,
    minStandardCost: 5000,
    enabled: true,
  },
  {
    name: 'High cost surgery',
    description: 'Flag a surgery whose standard cost is $2,500 or more.',
    codeType: 'CPT',
    code: null,
    category: 'Surgery',
    minStandardCost: 2500,
    enabled: true,
  },
  {
    name: 'High cost drug',
    description: 'Flag a drug or injection whose standard cost is $1,000 or more.',
    codeType: 'HCPCS',
    code: null,
    category: 'Drugs and Injections',
    minStandardCost: 1000,
    enabled: true,
  },
];
