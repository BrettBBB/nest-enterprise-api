import { ConflictException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { ClaimRulesService } from './claim-rules.service.js';

describe('ClaimRulesService', () => {
  const prisma = {
    claimRule: {
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
  const service = new ClaimRulesService(prisma as never);

  beforeEach(() => {
    vi.clearAllMocks();
    prisma.claimRule.findMany.mockResolvedValue([]);
    prisma.claim.findMany.mockResolvedValue([]);
  });

  it('passes the grid where, sort, and page to the database', async () => {
    prisma.claimRule.findMany.mockResolvedValue([]);
    prisma.claimRule.count.mockResolvedValue(0);

    await service.findClaimRules({
      where: { enabled: true },
      orderBy: [{ name: 'asc' }],
      skip: 0,
      take: 25,
    });

    expect(prisma.claimRule.findMany).toHaveBeenCalledWith({
      where: { enabled: true },
      orderBy: [{ name: 'asc' }],
      skip: 0,
      take: 25,
    });
  });

  it('refreshes claim outcomes after a rule is saved', async () => {
    prisma.claimRule.create.mockResolvedValue({ id: 'rule-1' });
    prisma.claimRule.findMany.mockResolvedValue([
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

    await service.createClaimRule({
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
    prisma.claimRule.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(
      service.createClaimRule({
        name: 'High dollar claim',
        description: 'Any claim billed at $5,000 or more.',
        minFeeCents: 500_000,
        enabled: true,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
