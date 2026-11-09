import { DiagnosisCodesService } from './diagnosis-codes.service.js';

describe('DiagnosisCodesService', () => {
  const prisma = {
    diagnosisCode: { findMany: vi.fn(), count: vi.fn(), findUnique: vi.fn() },
  };
  const service = new DiagnosisCodesService(prisma as never);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes the grid where, order, and page through to Postgres', async () => {
    prisma.diagnosisCode.findMany.mockResolvedValue([]);
    prisma.diagnosisCode.count.mockResolvedValue(0);

    await service.findDiagnosisCodes({
      where: { isHccEligible: true },
      orderBy: [{ code: 'asc' }],
      skip: 0,
      take: 25,
    });

    expect(prisma.diagnosisCode.findMany).toHaveBeenCalledWith({
      where: { isHccEligible: true },
      orderBy: [{ code: 'asc' }],
      skip: 0,
      take: 25,
    });
  });

  it('asks Postgres for distinct categories and drops blanks', async () => {
    prisma.diagnosisCode.findMany.mockResolvedValue([{ category: 'Endocrine' }, { category: null }, { category: '' }]);

    await expect(service.findDiagnosisCategories()).resolves.toEqual(['Endocrine']);
    expect(prisma.diagnosisCode.findMany).toHaveBeenCalledWith({
      where: { category: { not: '' } },
      distinct: ['category'],
      select: { category: true },
      orderBy: { category: 'asc' },
    });
  });
});
