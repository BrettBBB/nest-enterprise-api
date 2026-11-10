import { Test, TestingModule } from '@nestjs/testing';
import { AdminGuard } from '../auth/admin.guard.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { parseGridQuery, toGridListArgs } from '../common/grid-query.js';
import { DiagnosisRulesController } from './diagnosis-rules.controller.js';
import { DiagnosisRulesService } from './diagnosis-rules.service.js';
import {
  createDiagnosisRuleExample,
  diagnosisRuleResponseExample,
  updateDiagnosisRuleExample,
} from './dto/diagnosis-rule.examples.js';
import { diagnosisRuleGridFields, diagnosisRuleQuickFilterFields } from './diagnosis-rule-grid.js';

describe('DiagnosisRulesController', () => {
  let controller: DiagnosisRulesController;
  const diagnosisRulesService = {
    createDiagnosisRule: vi.fn(),
    findDiagnosisRules: vi.fn(),
    updateDiagnosisRule: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiagnosisRulesController],
      providers: [{ provide: DiagnosisRulesService, useValue: diagnosisRulesService }],
    })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get(DiagnosisRulesController);
  });

  it('maps a create DTO onto the diagnosis rule model', async () => {
    diagnosisRulesService.createDiagnosisRule.mockResolvedValue(diagnosisRuleResponseExample);

    await expect(controller.create({ ...createDiagnosisRuleExample })).resolves.toBe(diagnosisRuleResponseExample);
    expect(diagnosisRulesService.createDiagnosisRule).toHaveBeenCalledWith({
      name: createDiagnosisRuleExample.name,
      description: createDiagnosisRuleExample.description,
      code: null,
      category: null,
      laterality: null,
      requireHccEligible: true,
      enabled: true,
    });
  });

  it('maps a grid query onto a database page', async () => {
    const grid = JSON.stringify({
      filterModel: { items: [{ field: 'requireHccEligible', operator: 'is', value: true }] },
    });
    diagnosisRulesService.findDiagnosisRules.mockResolvedValue({
      rows: [diagnosisRuleResponseExample],
      rowCount: 1,
    });

    await expect(controller.findAll(grid)).resolves.toEqual({
      rows: [diagnosisRuleResponseExample],
      rowCount: 1,
    });
    expect(diagnosisRulesService.findDiagnosisRules).toHaveBeenCalledWith(
      toGridListArgs(await parseGridQuery(grid), {
        fields: diagnosisRuleGridFields,
        quickFilterFields: diagnosisRuleQuickFilterFields,
      }),
    );
  });

  it('maps an update and leaves omitted fields unset', async () => {
    diagnosisRulesService.updateDiagnosisRule.mockResolvedValue(diagnosisRuleResponseExample);

    await controller.update({ id: diagnosisRuleResponseExample.id }, { ...updateDiagnosisRuleExample });

    expect(diagnosisRulesService.updateDiagnosisRule).toHaveBeenCalledWith(diagnosisRuleResponseExample.id, {
      name: undefined,
      description: undefined,
      code: undefined,
      category: undefined,
      laterality: undefined,
      requireHccEligible: false,
      enabled: false,
    });
  });
});
