import { Test, TestingModule } from '@nestjs/testing';
import { AdminGuard } from '../auth/admin.guard.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { parseGridQuery, toGridListArgs } from '../common/grid-query.js';
import { createClaimRuleExample, claimRuleResponseExample, updateClaimRuleExample } from './dto/claim-rule.examples.js';
import { claimRuleEnumValues, claimRuleGridFields, claimRuleQuickFilterFields } from './claim-rule-grid.js';
import { ClaimRulesController } from './claim-rules.controller.js';
import { ClaimRulesService } from './claim-rules.service.js';

describe('ClaimRulesController', () => {
  let controller: ClaimRulesController;
  const claimRulesService = {
    createClaimRule: vi.fn(),
    findClaimRules: vi.fn(),
    updateClaimRule: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClaimRulesController],
      providers: [{ provide: ClaimRulesService, useValue: claimRulesService }],
    })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(ClaimRulesController);
  });

  it('maps a create DTO onto the rule model', async () => {
    claimRulesService.createClaimRule.mockResolvedValue(claimRuleResponseExample);

    await expect(controller.create({ ...createClaimRuleExample })).resolves.toBe(claimRuleResponseExample);
    expect(claimRulesService.createClaimRule).toHaveBeenCalledWith({
      name: createClaimRuleExample.name,
      description: createClaimRuleExample.description,
      codeType: null,
      code: null,
      category: null,
      minFeeCents: createClaimRuleExample.minFeeCents,
      enabled: true,
    });
  });

  it('maps a grid query onto a database page', async () => {
    const grid = JSON.stringify({
      paginationModel: { page: 0, pageSize: 25 },
      filterModel: { items: [{ field: 'enabled', operator: 'is', value: true }] },
    });
    claimRulesService.findClaimRules.mockResolvedValue({ rows: [claimRuleResponseExample], rowCount: 1 });

    await expect(controller.findAll(grid)).resolves.toEqual({
      rows: [claimRuleResponseExample],
      rowCount: 1,
    });
    expect(claimRulesService.findClaimRules).toHaveBeenCalledWith(
      toGridListArgs(await parseGridQuery(grid), {
        fields: claimRuleGridFields,
        enumValues: claimRuleEnumValues,
        quickFilterFields: claimRuleQuickFilterFields,
      }),
    );
  });

  it('maps an update and leaves omitted fields unset', async () => {
    claimRulesService.updateClaimRule.mockResolvedValue(claimRuleResponseExample);

    await controller.update({ id: claimRuleResponseExample.id }, { ...updateClaimRuleExample });

    expect(claimRulesService.updateClaimRule).toHaveBeenCalledWith(claimRuleResponseExample.id, {
      name: undefined,
      description: undefined,
      codeType: undefined,
      code: undefined,
      category: undefined,
      minFeeCents: updateClaimRuleExample.minFeeCents,
      enabled: false,
    });
  });
});
