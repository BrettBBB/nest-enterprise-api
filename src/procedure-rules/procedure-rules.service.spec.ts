import { ConflictException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { ProcedureRulesService } from './procedure-rules.service.js';

describe('ProcedureRulesService', () => {
  const prisma = {
    procedureRule: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    diagnosisRule: { findMany: vi.fn() },
    procedureCode: { findMany: vi.fn() },
    diagnosisCode: { findMany: vi.fn() },
    claim: { findMany: vi.fn(), update: vi.fn() },
  };
  const service = new ProcedureRulesService(prisma as never);

  beforeEach(() => {
    vi.clearAllMocks();
    prisma.procedureRule.findMany.mockResolvedValue([]);
    prisma.diagnosisRule.findMany.mockResolvedValue([]);
    prisma.procedureCode.findMany.mockResolvedValue([]);
    prisma.diagnosisCode.findMany.mockResolvedValue([]);
    prisma.claim.findMany.mockResolvedValue([]);
  });

  it('passes the grid query through to Postgres', async () => {
    prisma.procedureRule.findMany.mockResolvedValue([]);
    prisma.procedureRule.count.mockResolvedValue(0);

    await service.findProcedureRules({
      where: { enabled: true },
      orderBy: [{ name: 'asc' }],
      skip: 0,
      take: 25,
    });

    expect(prisma.procedureRule.findMany).toHaveBeenCalledWith({
      where: { enabled: true },
      orderBy: [{ name: 'asc' }],
      skip: 0,
      take: 25,
    });
  });

  it('rescores procedure flags after a rule is saved', async () => {
    prisma.procedureRule.create.mockResolvedValue({ id: 'rule-1', minStandardCost: 5000 });
    prisma.procedureRule.findMany.mockResolvedValue([
      { enabled: true, codeType: null, code: null, category: null, minStandardCost: 5000 },
    ]);
    prisma.procedureCode.findMany.mockResolvedValue([
      { code: '33533', codeType: 'CPT', category: 'Surgery', standardCost: 8000 },
    ]);
    prisma.claim.findMany.mockResolvedValue([
      { id: 'claim-1', codeType: 'CPT', code: '33533', procedureFlag: 'PASSED', diagnosisFlag: 'PASSED' },
    ]);

    await service.createProcedureRule({
      name: 'High cost procedure',
      description: 'Flag a procedure whose standard cost is $5,000 or more.',
      codeType: null,
      code: null,
      category: null,
      minStandardCost: 5000,
      enabled: true,
    });

    expect(prisma.claim.update).toHaveBeenCalledWith({
      where: { id: 'claim-1' },
      data: { procedureFlag: 'TRIGGERED', diagnosisFlag: 'PASSED' },
    });
  });

  it('turns a duplicate name into a conflict', async () => {
    prisma.procedureRule.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(
      service.createProcedureRule({
        name: 'High cost procedure',
        description: 'Flag a procedure whose standard cost is $5,000 or more.',
        minStandardCost: 5000,
        enabled: true,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
