import { ConflictException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { DiagnosisRulesService } from './diagnosis-rules.service.js';

describe('DiagnosisRulesService', () => {
  const prisma = {
    diagnosisRule: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    procedureRule: { findMany: vi.fn() },
    procedureCode: { findMany: vi.fn() },
    diagnosisCode: { findMany: vi.fn() },
    claim: { findMany: vi.fn(), update: vi.fn() },
  };
  const service = new DiagnosisRulesService(prisma as never);

  beforeEach(() => {
    vi.clearAllMocks();
    prisma.diagnosisRule.findMany.mockResolvedValue([]);
    prisma.procedureRule.findMany.mockResolvedValue([]);
    prisma.procedureCode.findMany.mockResolvedValue([]);
    prisma.diagnosisCode.findMany.mockResolvedValue([]);
    prisma.claim.findMany.mockResolvedValue([]);
  });

  it('passes the grid query through to Postgres', async () => {
    prisma.diagnosisRule.findMany.mockResolvedValue([]);
    prisma.diagnosisRule.count.mockResolvedValue(0);

    await service.findDiagnosisRules({
      where: { requireHccEligible: true },
      orderBy: [{ name: 'asc' }],
      skip: 0,
      take: 25,
    });

    expect(prisma.diagnosisRule.findMany).toHaveBeenCalledWith({
      where: { requireHccEligible: true },
      orderBy: [{ name: 'asc' }],
      skip: 0,
      take: 25,
    });
  });

  it('rescores diagnosis flags after a rule is saved', async () => {
    prisma.diagnosisRule.create.mockResolvedValue({ id: 'rule-1' });
    prisma.diagnosisRule.findMany.mockResolvedValue([
      { enabled: true, code: null, category: null, laterality: null, requireHccEligible: true },
    ]);
    prisma.diagnosisCode.findMany.mockResolvedValue([
      { code: 'E119', category: 'Endocrine', laterality: null, isHccEligible: true },
    ]);
    prisma.claim.findMany.mockResolvedValue([
      { id: 'claim-1', codeType: 'ICD10', code: 'E119', procedureFlag: 'PASSED', diagnosisFlag: 'PASSED' },
    ]);

    await service.createDiagnosisRule({
      name: 'Future HCC cost',
      description: 'Flag an HCC-eligible diagnosis.',
      code: null,
      category: null,
      laterality: null,
      requireHccEligible: true,
      enabled: true,
    });

    expect(prisma.claim.update).toHaveBeenCalledWith({
      where: { id: 'claim-1' },
      data: { procedureFlag: 'PASSED', diagnosisFlag: 'TRIGGERED' },
    });
  });

  it('turns a duplicate name into a conflict', async () => {
    prisma.diagnosisRule.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(
      service.createDiagnosisRule({
        name: 'Future HCC cost',
        description: 'Flag an HCC-eligible diagnosis.',
        requireHccEligible: true,
        enabled: true,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
