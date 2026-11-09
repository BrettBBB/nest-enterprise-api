import { ProcedureCodesService } from './procedure-codes.service.js';

describe('ProcedureCodesService', () => {
  const prisma = {
    procedureCode: { findMany: vi.fn(), count: vi.fn(), findUnique: vi.fn() },
  };
  const service = new ProcedureCodesService(prisma as never);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes the grid where, order, and page through to Postgres', async () => {
    prisma.procedureCode.findMany.mockResolvedValue([]);
    prisma.procedureCode.count.mockResolvedValue(0);

    await service.findProcedureCodes({
      where: { codeType: 'CPT' },
      orderBy: [{ standardCost: 'desc' }],
      skip: 25,
      take: 25,
    });

    expect(prisma.procedureCode.findMany).toHaveBeenCalledWith({
      where: { codeType: 'CPT' },
      orderBy: [{ standardCost: 'desc' }],
      skip: 25,
      take: 25,
    });
  });

  it('asks Postgres for distinct categories and drops blanks', async () => {
    prisma.procedureCode.findMany.mockResolvedValue([{ category: 'Surgery' }, { category: null }, { category: '' }]);

    await expect(service.findProcedureCategories()).resolves.toEqual(['Surgery']);
    expect(prisma.procedureCode.findMany).toHaveBeenCalledWith({
      where: { category: { not: '' } },
      distinct: ['category'],
      select: { category: true },
      orderBy: { category: 'asc' },
    });
  });
});
