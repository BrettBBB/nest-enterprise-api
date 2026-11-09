import { BadRequestException } from '@nestjs/common';
import { ClaimsService } from './claims.service.js';

describe('ClaimsService', () => {
  const prisma = {
    ruleDefinition: { findMany: vi.fn() },
    procedureCode: { findUnique: vi.fn() },
    diagnosisCode: { findUnique: vi.fn() },
    procedureRule: { findMany: vi.fn() },
    diagnosisRule: { findMany: vi.fn() },
    claim: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  };
  const service = new ClaimsService(prisma as never);

  beforeEach(() => {
    vi.clearAllMocks();
    prisma.procedureCode.findUnique.mockResolvedValue(null);
    prisma.diagnosisCode.findUnique.mockResolvedValue(null);
    prisma.procedureRule.findMany.mockResolvedValue([]);
    prisma.diagnosisRule.findMany.mockResolvedValue([]);
  });

  it('scores a new claim from the saved rules', async () => {
    prisma.procedureCode.findUnique.mockResolvedValue({
      code: '99213',
      codeType: 'CPT',
      category: 'Evaluation and Management',
      shortDescription: 'Office visit',
    });
    prisma.ruleDefinition.findMany.mockResolvedValue([
      {
        enabled: true,
        codeType: null,
        code: null,
        category: null,
        minFeeCents: 500_000,
      },
    ]);
    prisma.claim.create.mockResolvedValue({ id: 'claim-1', outcome: 'TRIGGERED' });

    await service.createClaim({
      claimNumber: 'CLM-100001',
      codeType: 'CPT',
      code: '99213',
      serviceDate: new Date('2026-03-04T00:00:00.000Z'),
      billedCents: 750_000,
    });

    expect(prisma.claim.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        claimNumber: 'CLM-100001',
        code: '99213',
        billedCents: 750_000,
        outcome: 'TRIGGERED',
        category: 'Evaluation and Management',
        description: 'Office visit',
      }),
    });
  });

  it('rejects a procedure code that is not in the catalog', async () => {
    prisma.procedureCode.findUnique.mockResolvedValue(null);

    await expect(
      service.createClaim({
        claimNumber: 'CLM-100002',
        codeType: 'CPT',
        code: '00000',
        serviceDate: new Date('2026-03-04T00:00:00.000Z'),
        billedCents: 1000,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('passes the grid where through to the database', async () => {
    prisma.claim.findMany.mockResolvedValue([]);
    prisma.claim.count.mockResolvedValue(0);

    await service.findClaims({
      where: { outcome: 'TRIGGERED' },
      orderBy: [{ billedCents: 'desc' }],
      skip: 25,
      take: 25,
    });

    expect(prisma.claim.findMany).toHaveBeenCalledWith({
      where: { outcome: 'TRIGGERED' },
      orderBy: [{ billedCents: 'desc' }],
      skip: 25,
      take: 25,
    });
  });
});
