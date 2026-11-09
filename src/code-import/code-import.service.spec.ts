import { CodeImportService } from './code-import.service.js';

describe('CodeImportService', () => {
  const tx = {
    procedureCode: { deleteMany: vi.fn(), createMany: vi.fn() },
    diagnosisCode: { deleteMany: vi.fn(), createMany: vi.fn() },
  };
  const prisma = {
    $transaction: vi.fn(async (run: (client: typeof tx) => Promise<void>) => run(tx)),
    claim: { findMany: vi.fn().mockResolvedValue([]), update: vi.fn() },
    procedureCode: { findMany: vi.fn().mockResolvedValue([]) },
    diagnosisCode: { findMany: vi.fn().mockResolvedValue([]) },
    procedureRule: { findMany: vi.fn().mockResolvedValue([]) },
    diagnosisRule: { findMany: vi.fn().mockResolvedValue([]) },
  };
  const service = new CodeImportService(prisma as never);

  beforeEach(() => {
    vi.clearAllMocks();
    prisma.$transaction.mockImplementation(async (run: (client: typeof tx) => Promise<void>) => run(tx));
    prisma.claim.findMany.mockResolvedValue([]);
    prisma.procedureCode.findMany.mockResolvedValue([]);
    prisma.diagnosisCode.findMany.mockResolvedValue([]);
    prisma.procedureRule.findMany.mockResolvedValue([]);
    prisma.diagnosisRule.findMany.mockResolvedValue([]);
  });

  it('replaces procedure codes from the CPT and HCPCS seed files', async () => {
    await expect(service.importProcedures()).resolves.toEqual({ imported: 10000 });
    expect(tx.procedureCode.deleteMany).toHaveBeenCalled();
    expect(tx.procedureCode.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ code: '10001', codeType: 'CPT' }),
          expect.objectContaining({ code: 'S0001', codeType: 'HCPCS' }),
        ]),
      }),
    );
  });

  it('replaces diagnosis codes from the ICD-10 seed file', async () => {
    await expect(service.importDiagnoses()).resolves.toEqual({ imported: 4108 });
    expect(tx.diagnosisCode.deleteMany).toHaveBeenCalled();
    expect(tx.diagnosisCode.createMany.mock.calls[0]?.[0].data).toHaveLength(4108);
  });
});
