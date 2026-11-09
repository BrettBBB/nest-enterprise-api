import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminGuard } from '../auth/admin.guard.js';
import { parseGridQuery, toGridListArgs } from '../common/grid-query.js';
import { DiagnosisRulesService } from './diagnosis-rules.service.js';
import { CreateDiagnosisRuleDto } from './dto/create-diagnosis-rule.dto.js';
import { DiagnosisRuleIdParamDto } from './dto/diagnosis-rule-id-param.dto.js';
import { DiagnosisRuleGridPageDto } from './dto/diagnosis-rule-page.dto.js';
import { DiagnosisRuleResponseDto } from './dto/diagnosis-rule-response.dto.js';
import {
  createDiagnosisRuleExample,
  diagnosisRulePageExample,
  diagnosisRuleResponseExample,
  updateDiagnosisRuleExample,
} from './dto/diagnosis-rule.examples.js';
import { UpdateDiagnosisRuleDto } from './dto/update-diagnosis-rule.dto.js';
import { toDiagnosisRuleCreateInput, toDiagnosisRuleUpdateInput } from './diagnosis-rule-input.js';
import { diagnosisRuleGridFields, diagnosisRuleQuickFilterFields } from './diagnosis-rule-grid.js';

@ApiTags('diagnosis-rules')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
@ApiForbiddenResponse({ description: 'The access token is not an administrator.' })
@UseGuards(AdminGuard)
@Controller('diagnosis-rules')
export class DiagnosisRulesController {
  constructor(private readonly diagnosisRulesService: DiagnosisRulesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a diagnosis cost rule' })
  @ApiBody({
    type: CreateDiagnosisRuleDto,
    examples: { sample: { summary: 'Future HCC cost', value: createDiagnosisRuleExample } },
  })
  @ApiResponse({ status: 201, type: DiagnosisRuleResponseDto, example: diagnosisRuleResponseExample })
  @ApiResponse({ status: 400, description: 'Invalid input or validation failed.' })
  @ApiResponse({ status: 409, description: 'That diagnosis rule name already exists.' })
  async create(@Body() dto: CreateDiagnosisRuleDto) {
    return this.diagnosisRulesService.createDiagnosisRule(toDiagnosisRuleCreateInput(dto));
  }

  @Get()
  @ApiOperation({
    summary: 'List diagnosis cost rules',
    description:
      'An ICD-10 claim is flagged when the diagnosis matches the code, category, laterality, and HCC requirement on an enabled rule. The grid query runs in the database.',
  })
  @ApiQuery({ name: 'grid', required: false, description: 'JSON GridGetRowsParams from the data grid.' })
  @ApiResponse({ status: 200, type: DiagnosisRuleGridPageDto, example: diagnosisRulePageExample })
  @ApiResponse({ status: 400, description: 'Invalid filter, sort, or page.' })
  async findAll(@Query('grid') grid?: string) {
    const query = await parseGridQuery(grid);
    return this.diagnosisRulesService.findDiagnosisRules(
      toGridListArgs(query, {
        fields: diagnosisRuleGridFields,
        quickFilterFields: diagnosisRuleQuickFilterFields,
      }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a diagnosis cost rule by ID' })
  @ApiResponse({ status: 200, type: DiagnosisRuleResponseDto, example: diagnosisRuleResponseExample })
  @ApiResponse({ status: 404, description: 'Diagnosis rule not found.' })
  async findOne(@Param() params: DiagnosisRuleIdParamDto) {
    return this.diagnosisRulesService.findDiagnosisRuleById(params.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a diagnosis cost rule by ID' })
  @ApiBody({
    type: UpdateDiagnosisRuleDto,
    examples: { sample: { summary: 'Sample update', value: updateDiagnosisRuleExample } },
  })
  @ApiResponse({
    status: 200,
    type: DiagnosisRuleResponseDto,
    example: { ...diagnosisRuleResponseExample, ...updateDiagnosisRuleExample },
  })
  @ApiResponse({ status: 400, description: 'Invalid input or validation failed.' })
  @ApiResponse({ status: 404, description: 'Diagnosis rule not found.' })
  @ApiResponse({ status: 409, description: 'That diagnosis rule name already exists.' })
  async update(@Param() params: DiagnosisRuleIdParamDto, @Body() dto: UpdateDiagnosisRuleDto) {
    return this.diagnosisRulesService.updateDiagnosisRule(params.id, toDiagnosisRuleUpdateInput(dto));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a diagnosis cost rule by ID' })
  @ApiResponse({ status: 200, type: DiagnosisRuleResponseDto, example: diagnosisRuleResponseExample })
  @ApiResponse({ status: 404, description: 'Diagnosis rule not found.' })
  async delete(@Param() params: DiagnosisRuleIdParamDto) {
    return this.diagnosisRulesService.deleteDiagnosisRule(params.id);
  }
}
