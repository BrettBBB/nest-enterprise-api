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
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CodeImportService } from '../code-import/code-import.service.js';
import { CodeImportResultDto } from '../code-import/dto/code-import-result.dto.js';
import { codeImportResultExample } from '../code-import/dto/code-import.examples.js';
import { parseGridQuery, toGridListArgs } from '../common/grid-query.js';
import { DiagnosisCodesService } from './diagnosis-codes.service.js';
import { DiagnosisCategoriesDto } from './dto/diagnosis-categories.dto.js';
import { DiagnosisCodeGridPageDto } from './dto/diagnosis-code-page.dto.js';
import { DiagnosisCodeParamDto } from './dto/diagnosis-code-param.dto.js';
import { DiagnosisCodeResponseDto } from './dto/diagnosis-code-response.dto.js';
import {
  diagnosisCategoriesExample,
  diagnosisCodePageExample,
  diagnosisCodeResponseExample,
} from './dto/diagnosis-code.examples.js';
import {
  diagnosisCodeEnumValues,
  diagnosisCodeGridFields,
  diagnosisCodeQuickFilterFields,
} from './diagnosis-code-grid.js';

@ApiTags('diagnosis-codes')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
@UseGuards(JwtAuthGuard)
@Controller('diagnosis-codes')
export class DiagnosisCodesController {
  constructor(
    private readonly diagnosisCodesService: DiagnosisCodesService,
    private readonly codeImportService: CodeImportService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List diagnosis codes',
    description:
      'Read-only page of ICD-10-CM codes. Pass one grid query for page, sort, filter, and quick filter. The database applies it.',
  })
  @ApiQuery({ name: 'grid', required: false, description: 'JSON GridGetRowsParams from the data grid.' })
  @ApiResponse({ status: 200, type: DiagnosisCodeGridPageDto, example: diagnosisCodePageExample })
  async findAll(@Query('grid') grid?: string) {
    const query = await parseGridQuery(grid);
    return this.diagnosisCodesService.findDiagnosisCodes(
      toGridListArgs(query, {
        fields: diagnosisCodeGridFields,
        enumValues: diagnosisCodeEnumValues,
        quickFilterFields: diagnosisCodeQuickFilterFields,
      }),
    );
  }

  @Post('import')
  @UseGuards(AdminGuard)
  @ApiForbiddenResponse({ description: 'The access token is not an administrator.' })
  @ApiOperation({
    summary: 'Import diagnosis codes',
    description: 'Administrators replace the diagnosis table from the ICD-10 seed file.',
  })
  @ApiResponse({ status: 200, type: CodeImportResultDto, example: codeImportResultExample })
  importCodes() {
    return this.codeImportService.importDiagnoses();
  }

  @Get('categories')
  @ApiOperation({
    summary: 'List distinct diagnosis categories',
    description: 'The category names on ICD-10-CM rows. The browser uses this short list in rule forms.',
  })
  @ApiResponse({ status: 200, type: DiagnosisCategoriesDto, example: diagnosisCategoriesExample })
  async findCategories() {
    return { categories: await this.diagnosisCodesService.findDiagnosisCategories() };
  }

  @Get(':code')
  @ApiOperation({ summary: 'Retrieve a diagnosis code' })
  @ApiResponse({ status: 200, type: DiagnosisCodeResponseDto, example: diagnosisCodeResponseExample })
  @ApiResponse({ status: 404, description: 'Diagnosis code not found.' })
  findOne(@Param() params: DiagnosisCodeParamDto) {
    return this.diagnosisCodesService.findDiagnosisCode(params.code);
  }
}
