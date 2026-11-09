import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminGuard } from '../auth/admin.guard.js';
import { CodeImportService } from '../code-import/code-import.service.js';
import { CodeImportResultDto } from '../code-import/dto/code-import-result.dto.js';
import { codeImportResultExample } from '../code-import/dto/code-import.examples.js';
import { parseGridQuery, toGridListArgs } from '../common/grid-query.js';
import { ProcedureCategoriesDto } from './dto/procedure-categories.dto.js';
import { ProcedureCodeGridPageDto } from './dto/procedure-code-page.dto.js';
import { ProcedureCodeParamDto } from './dto/procedure-code-param.dto.js';
import { ProcedureCodeResponseDto } from './dto/procedure-code-response.dto.js';
import {
  procedureCategoriesExample,
  procedureCodePageExample,
  procedureCodeResponseExample,
} from './dto/procedure-code.examples.js';
import {
  procedureCodeEnumValues,
  procedureCodeGridFields,
  procedureCodeQuickFilterFields,
} from './procedure-code-grid.js';
import { ProcedureCodesService } from './procedure-codes.service.js';

@ApiTags('procedure-codes')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
@ApiForbiddenResponse({ description: 'The access token is not an administrator.' })
@UseGuards(AdminGuard)
@Controller('procedure-codes')
export class ProcedureCodesController {
  constructor(
    private readonly procedureCodesService: ProcedureCodesService,
    private readonly codeImportService: CodeImportService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List procedure codes',
    description:
      'Read-only page of CPT and HCPCS codes. Pass one grid query for page, sort, filter, and quick filter. The database applies it.',
  })
  @ApiQuery({ name: 'grid', required: false, description: 'JSON GridGetRowsParams from the data grid.' })
  @ApiResponse({ status: 200, type: ProcedureCodeGridPageDto, example: procedureCodePageExample })
  async findAll(@Query('grid') grid?: string) {
    const query = await parseGridQuery(grid);
    return this.procedureCodesService.findProcedureCodes(
      toGridListArgs(query, {
        fields: procedureCodeGridFields,
        enumValues: procedureCodeEnumValues,
        quickFilterFields: procedureCodeQuickFilterFields,
      }),
    );
  }

  @Post('import')
  @ApiOperation({
    summary: 'Import procedure codes',
    description: 'Administrators replace the procedure table from the CPT and HCPCS seed files.',
  })
  @ApiResponse({ status: 200, type: CodeImportResultDto, example: codeImportResultExample })
  importCodes() {
    return this.codeImportService.importProcedures();
  }

  @Get('categories')
  @ApiOperation({
    summary: 'List distinct procedure categories',
    description: 'The category names on CPT and HCPCS rows. The browser uses this short list in rule forms.',
  })
  @ApiResponse({ status: 200, type: ProcedureCategoriesDto, example: procedureCategoriesExample })
  async findCategories() {
    return { categories: await this.procedureCodesService.findProcedureCategories() };
  }

  @Get(':code')
  @ApiOperation({ summary: 'Retrieve a procedure code' })
  @ApiResponse({ status: 200, type: ProcedureCodeResponseDto, example: procedureCodeResponseExample })
  @ApiResponse({ status: 404, description: 'Procedure code not found.' })
  findOne(@Param() params: ProcedureCodeParamDto) {
    return this.procedureCodesService.findProcedureCode(params.code);
  }
}
