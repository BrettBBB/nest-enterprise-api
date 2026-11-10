import { Test, TestingModule } from '@nestjs/testing';
import { AdminGuard } from '../auth/admin.guard.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { parseGridQuery, toGridListArgs } from '../common/grid-query.js';
import { procedureCodeResponseExample } from './dto/procedure-code.examples.js';
import {
  procedureCodeEnumValues,
  procedureCodeGridFields,
  procedureCodeQuickFilterFields,
} from './procedure-code-grid.js';
import { CodeImportService } from '../code-import/code-import.service.js';
import { ProcedureCodesController } from './procedure-codes.controller.js';
import { ProcedureCodesService } from './procedure-codes.service.js';

describe('ProcedureCodesController', () => {
  let controller: ProcedureCodesController;
  const procedureCodesService = { findProcedureCodes: vi.fn(), findProcedureCode: vi.fn() };
  const codeImportService = { importProcedures: vi.fn(), importDiagnoses: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProcedureCodesController],
      providers: [
        { provide: ProcedureCodesService, useValue: procedureCodesService },
        { provide: CodeImportService, useValue: codeImportService },
      ],
    })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get(ProcedureCodesController);
  });

  it('maps a grid query onto a database page', async () => {
    const grid = JSON.stringify({
      paginationModel: { page: 0, pageSize: 25 },
      sortModel: [{ field: 'standardCost', sort: 'desc' }],
      filterModel: { items: [{ field: 'codeType', operator: 'is', value: 'CPT' }] },
    });
    procedureCodesService.findProcedureCodes.mockResolvedValue({
      rows: [procedureCodeResponseExample],
      rowCount: 1,
    });

    await expect(controller.findAll(grid)).resolves.toEqual({
      rows: [procedureCodeResponseExample],
      rowCount: 1,
    });
    expect(procedureCodesService.findProcedureCodes).toHaveBeenCalledWith(
      toGridListArgs(await parseGridQuery(grid), {
        fields: procedureCodeGridFields,
        enumValues: procedureCodeEnumValues,
        quickFilterFields: procedureCodeQuickFilterFields,
      }),
    );
  });
});
