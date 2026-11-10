import { Test, TestingModule } from '@nestjs/testing';
import { AdminGuard } from '../auth/admin.guard.js';
import { parseGridQuery, toGridListArgs } from '../common/grid-query.js';
import { createRuleExample, ruleResponseExample, updateRuleExample } from './dto/rule.examples.js';
import { ruleEnumValues, ruleGridFields, ruleQuickFilterFields } from './rule-grid.js';
import { RulesController } from './rules.controller.js';
import { RulesService } from './rules.service.js';

describe('RulesController', () => {
  let controller: RulesController;
  const rulesService = {
    createRule: vi.fn(),
    findRules: vi.fn(),
    updateRule: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RulesController],
      providers: [{ provide: RulesService, useValue: rulesService }],
    })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(RulesController);
  });

  it('maps a create DTO onto the rule model', async () => {
    rulesService.createRule.mockResolvedValue(ruleResponseExample);

    await expect(controller.create({ ...createRuleExample })).resolves.toBe(ruleResponseExample);
    expect(rulesService.createRule).toHaveBeenCalledWith({
      name: createRuleExample.name,
      description: createRuleExample.description,
      codeType: null,
      code: null,
      category: null,
      minFeeCents: createRuleExample.minFeeCents,
      enabled: true,
    });
  });

  it('maps a grid query onto a database page', async () => {
    const grid = JSON.stringify({
      paginationModel: { page: 0, pageSize: 25 },
      filterModel: { items: [{ field: 'enabled', operator: 'is', value: true }] },
    });
    rulesService.findRules.mockResolvedValue({ rows: [ruleResponseExample], rowCount: 1 });

    await expect(controller.findAll(grid)).resolves.toEqual({
      rows: [ruleResponseExample],
      rowCount: 1,
    });
    expect(rulesService.findRules).toHaveBeenCalledWith(
      toGridListArgs(await parseGridQuery(grid), {
        fields: ruleGridFields,
        enumValues: ruleEnumValues,
        quickFilterFields: ruleQuickFilterFields,
      }),
    );
  });

  it('maps an update and leaves omitted fields unset', async () => {
    rulesService.updateRule.mockResolvedValue(ruleResponseExample);

    await controller.update({ id: ruleResponseExample.id }, { ...updateRuleExample });

    expect(rulesService.updateRule).toHaveBeenCalledWith(ruleResponseExample.id, {
      name: undefined,
      description: undefined,
      codeType: undefined,
      code: undefined,
      category: undefined,
      minFeeCents: updateRuleExample.minFeeCents,
      enabled: false,
    });
  });
});
