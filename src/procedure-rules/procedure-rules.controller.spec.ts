import { Test, TestingModule } from '@nestjs/testing';
import { AdminGuard } from '../auth/admin.guard.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { parseGridQuery, toGridListArgs } from '../common/grid-query.js';
import {
  createProcedureRuleExample,
  procedureRuleResponseExample,
  updateProcedureRuleExample,
} from './dto/procedure-rule.examples.js';
import {
  procedureRuleEnumValues,
  procedureRuleGridFields,
  procedureRuleQuickFilterFields,
} from './procedure-rule-grid.js';
import { ProcedureRulesController } from './procedure-rules.controller.js';
import { ProcedureRulesService } from './procedure-rules.service.js';

describe('ProcedureRulesController', () => {
  let controller: ProcedureRulesController;
  const procedureRulesService = {
    createProcedureRule: vi.fn(),
    findProcedureRules: vi.fn(),
    updateProcedureRule: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProcedureRulesController],
      providers: [{ provide: ProcedureRulesService, useValue: procedureRulesService }],
    })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get(ProcedureRulesController);
  });

  it('maps a create DTO onto the procedure rule model', async () => {
    procedureRulesService.createProcedureRule.mockResolvedValue(procedureRuleResponseExample);

    await expect(controller.create({ ...createProcedureRuleExample })).resolves.toBe(procedureRuleResponseExample);
    expect(procedureRulesService.createProcedureRule).toHaveBeenCalledWith({
      name: createProcedureRuleExample.name,
      description: createProcedureRuleExample.description,
      codeType: null,
      code: null,
      category: null,
      minStandardCost: createProcedureRuleExample.minStandardCost,
      enabled: true,
    });
  });

  it('maps a grid query onto a database page', async () => {
    const grid = JSON.stringify({
      paginationModel: { page: 0, pageSize: 25 },
      sortModel: [{ field: 'minStandardCost', sort: 'desc' }],
    });
    procedureRulesService.findProcedureRules.mockResolvedValue({
      rows: [procedureRuleResponseExample],
      rowCount: 1,
    });

    await expect(controller.findAll(grid)).resolves.toEqual({
      rows: [procedureRuleResponseExample],
      rowCount: 1,
    });
    expect(procedureRulesService.findProcedureRules).toHaveBeenCalledWith(
      toGridListArgs(await parseGridQuery(grid), {
        fields: procedureRuleGridFields,
        enumValues: procedureRuleEnumValues,
        quickFilterFields: procedureRuleQuickFilterFields,
      }),
    );
  });

  it('maps an update and leaves omitted fields unset', async () => {
    procedureRulesService.updateProcedureRule.mockResolvedValue(procedureRuleResponseExample);

    await controller.update({ id: procedureRuleResponseExample.id }, { ...updateProcedureRuleExample });

    expect(procedureRulesService.updateProcedureRule).toHaveBeenCalledWith(procedureRuleResponseExample.id, {
      name: undefined,
      description: undefined,
      codeType: undefined,
      code: undefined,
      category: undefined,
      minStandardCost: updateProcedureRuleExample.minStandardCost,
      enabled: false,
    });
  });
});
