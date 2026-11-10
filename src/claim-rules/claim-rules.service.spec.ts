import { ConflictException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { RulesService } from './rules.service.js';

describe('RulesService', () => {
  const prisma = {
    ruleDefinition: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    claim: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
  };
  const service = new RulesService(prisma as never);

  beforeEach(() => {
    vi.clearAllMocks();
    prisma.ruleDefinition.findMany.mockResolvedValue([]);
    prisma.claim.findMany.mockResolvedValue([]);
  });

  it('passes the grid where, sort, and page to the database', async () => {
    prisma.ruleDefinition.findMany.mockResolvedValue([]);
    prisma.ruleDefinition.count.mockResolvedValue(0);

    await service.findRules({
      where: { enabled: true },
      orderBy: [{ name: 'asc' }],
      skip: 0,
      take: 25,
    });

    expect(prisma.ruleDefinition.findMany).toHaveBeenCalledWith({
      where: { enabled: true },
      orderBy: [{ name: 'asc' }],
      skip: 0,
      take: 25,
    });
  });

  it('refreshes claim outcomes after a rule is saved', async () => {
    prisma.ruleDefinition.create.mockResolvedValue({ id: 'rule-1' });
    prisma.ruleDefinition.findMany.mockResolvedValue([
      {
        enabled: true,
        codeType: null,
        code: null,
        category: null,
        minFeeCents: 500_000,
      },
    ]);
    prisma.claim.findMany.mockResolvedValue([
      {
        id: 'claim-1',
        codeType: 'CPT',
        code: '99213',
        category: 'Evaluation and Management',
        billedCents: 750_000,
        outcome: 'PASSED',
      },
    ]);

    await service.createRule({
      name: 'High dollar claim',
      description: 'Any claim billed at $5,000 or more.',
      codeType: null,
      code: null,
      category: null,
      minFeeCents: 500_000,
      enabled: true,
    });

    expect(prisma.claim.update).toHaveBeenCalledWith({
      where: { id: 'claim-1' },
      data: { outcome: 'TRIGGERED' },
    });
  });

  it('turns a duplicate name into a conflict', async () => {
    prisma.ruleDefinition.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(
      service.createRule({
        name: 'High dollar claim',
        description: 'Any claim billed at $5,000 or more.',
        minFeeCents: 500_000,
        enabled: true,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
