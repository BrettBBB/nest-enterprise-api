import { Test, TestingModule } from '@nestjs/testing';
import { AdminGuard } from '../auth/admin.guard.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { parseGridQuery, toGridListArgs } from '../common/grid-query.js';
import { claimEnumValues, claimGridFields, claimQuickFilterFields } from './claim-grid.js';
import { ClaimsController } from './claims.controller.js';
import { ClaimsService } from './claims.service.js';
import { claimResponseExample, createClaimExample } from './dto/claim.examples.js';

describe('ClaimsController', () => {
  let controller: ClaimsController;
  const claimsService = {
    createClaim: vi.fn(),
    findClaims: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClaimsController],
      providers: [{ provide: ClaimsService, useValue: claimsService }],
    })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(ClaimsController);
  });

  it('maps a create DTO onto the claim write', async () => {
    claimsService.createClaim.mockResolvedValue(claimResponseExample);

    await expect(controller.create({ ...createClaimExample })).resolves.toBe(claimResponseExample);
    expect(claimsService.createClaim).toHaveBeenCalledWith({
      claimNumber: 'CLM-100001',
      codeType: 'CPT',
      code: '99213',
      serviceDate: new Date('2026-03-04T00:00:00.000Z'),
      billedCents: 750_000,
    });
  });

  it('maps an outcome filter onto a database page', async () => {
    const grid = JSON.stringify({
      paginationModel: { page: 1, pageSize: 25 },
      sortModel: [{ field: 'billedCents', sort: 'desc' }],
      filterModel: { items: [{ field: 'outcome', operator: 'is', value: 'TRIGGERED' }] },
    });
    claimsService.findClaims.mockResolvedValue({ rows: [claimResponseExample], rowCount: 1 });

    await controller.findAll(grid);

    expect(claimsService.findClaims).toHaveBeenCalledWith(
      toGridListArgs(await parseGridQuery(grid), {
        fields: claimGridFields,
        enumValues: claimEnumValues,
        quickFilterFields: claimQuickFilterFields,
      }),
    );
  });
});
