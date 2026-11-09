import { Test, TestingModule } from '@nestjs/testing';
import { AdminGuard } from '../auth/admin.guard.js';
import { parseGridQuery, toGridListArgs } from '../common/grid-query.js';
import { CodeImportService } from '../code-import/code-import.service.js';
import { DiagnosisCodesController } from './diagnosis-codes.controller.js';
import { DiagnosisCodesService } from './diagnosis-codes.service.js';
import { diagnosisCodeResponseExample } from './dto/diagnosis-code.examples.js';
import {
  diagnosisCodeEnumValues,
  diagnosisCodeGridFields,
  diagnosisCodeQuickFilterFields,
} from './diagnosis-code-grid.js';

describe('DiagnosisCodesController', () => {
  let controller: DiagnosisCodesController;
  const diagnosisCodesService = { findDiagnosisCodes: vi.fn(), findDiagnosisCode: vi.fn() };
  const codeImportService = { importProcedures: vi.fn(), importDiagnoses: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiagnosisCodesController],
      providers: [
        { provide: DiagnosisCodesService, useValue: diagnosisCodesService },
        { provide: CodeImportService, useValue: codeImportService },
      ],
    })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get(DiagnosisCodesController);
  });

  it('maps a grid query onto a database page', async () => {
    const grid = JSON.stringify({
      paginationModel: { page: 0, pageSize: 25 },
      filterModel: { items: [{ field: 'isHccEligible', operator: 'is', value: true }] },
    });
    diagnosisCodesService.findDiagnosisCodes.mockResolvedValue({
      rows: [diagnosisCodeResponseExample],
      rowCount: 1,
    });

    await expect(controller.findAll(grid)).resolves.toEqual({
      rows: [diagnosisCodeResponseExample],
      rowCount: 1,
    });
    expect(diagnosisCodesService.findDiagnosisCodes).toHaveBeenCalledWith(
      toGridListArgs(await parseGridQuery(grid), {
        fields: diagnosisCodeGridFields,
        enumValues: diagnosisCodeEnumValues,
        quickFilterFields: diagnosisCodeQuickFilterFields,
      }),
    );
  });
});
