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
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { parseGridQuery, toGridListArgs } from '../common/grid-query.js';
import { CreateProcedureRuleDto } from './dto/create-procedure-rule.dto.js';
import { ProcedureRuleIdParamDto } from './dto/procedure-rule-id-param.dto.js';
import { ProcedureRuleGridPageDto } from './dto/procedure-rule-page.dto.js';
import { ProcedureRuleResponseDto } from './dto/procedure-rule-response.dto.js';
import {
  createProcedureRuleExample,
  procedureRulePageExample,
  procedureRuleResponseExample,
  updateProcedureRuleExample,
} from './dto/procedure-rule.examples.js';
import { UpdateProcedureRuleDto } from './dto/update-procedure-rule.dto.js';
import { toProcedureRuleCreateInput, toProcedureRuleUpdateInput } from './procedure-rule-input.js';
import {
  procedureRuleEnumValues,
  procedureRuleGridFields,
  procedureRuleQuickFilterFields,
} from './procedure-rule-grid.js';
import { ProcedureRulesService } from './procedure-rules.service.js';

@ApiTags('procedure-rules')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
@UseGuards(JwtAuthGuard)
@Controller('procedure-rules')
export class ProcedureRulesController {
  constructor(private readonly procedureRulesService: ProcedureRulesService) {}

  @Post()
  @UseGuards(AdminGuard)
  @ApiForbiddenResponse({ description: 'The access token is not an administrator.' })
  @ApiOperation({ summary: 'Create a procedure cost rule' })
  @ApiBody({
    type: CreateProcedureRuleDto,
    examples: { sample: { summary: 'High cost procedure', value: createProcedureRuleExample } },
  })
  @ApiResponse({ status: 201, type: ProcedureRuleResponseDto, example: procedureRuleResponseExample })
  @ApiResponse({ status: 400, description: 'Invalid input or validation failed.' })
  @ApiResponse({ status: 409, description: 'That procedure rule name already exists.' })
  async create(@Body() dto: CreateProcedureRuleDto) {
    return this.procedureRulesService.createProcedureRule(toProcedureRuleCreateInput(dto));
  }

  @Get()
  @ApiOperation({
    summary: 'List procedure cost rules',
    description:
      'A CPT or HCPCS claim is flagged when the procedure standard cost meets the minimum and any code type, code, or category on the rule also matches. The grid query runs in the database.',
  })
  @ApiQuery({ name: 'grid', required: false, description: 'JSON GridGetRowsParams from the data grid.' })
  @ApiResponse({ status: 200, type: ProcedureRuleGridPageDto, example: procedureRulePageExample })
  @ApiResponse({ status: 400, description: 'Invalid filter, sort, or page.' })
  async findAll(@Query('grid') grid?: string) {
    const query = await parseGridQuery(grid);
    return this.procedureRulesService.findProcedureRules(
      toGridListArgs(query, {
        fields: procedureRuleGridFields,
        enumValues: procedureRuleEnumValues,
        quickFilterFields: procedureRuleQuickFilterFields,
      }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a procedure cost rule by ID' })
  @ApiResponse({ status: 200, type: ProcedureRuleResponseDto, example: procedureRuleResponseExample })
  @ApiResponse({ status: 404, description: 'Procedure rule not found.' })
  async findOne(@Param() params: ProcedureRuleIdParamDto) {
    return this.procedureRulesService.findProcedureRuleById(params.id);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @ApiForbiddenResponse({ description: 'The access token is not an administrator.' })
  @ApiOperation({ summary: 'Update a procedure cost rule by ID' })
  @ApiBody({
    type: UpdateProcedureRuleDto,
    examples: { sample: { summary: 'Sample update', value: updateProcedureRuleExample } },
  })
  @ApiResponse({
    status: 200,
    type: ProcedureRuleResponseDto,
    example: { ...procedureRuleResponseExample, ...updateProcedureRuleExample },
  })
  @ApiResponse({ status: 400, description: 'Invalid input or validation failed.' })
  @ApiResponse({ status: 404, description: 'Procedure rule not found.' })
  @ApiResponse({ status: 409, description: 'That procedure rule name already exists.' })
  async update(@Param() params: ProcedureRuleIdParamDto, @Body() dto: UpdateProcedureRuleDto) {
    return this.procedureRulesService.updateProcedureRule(params.id, toProcedureRuleUpdateInput(dto));
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiForbiddenResponse({ description: 'The access token is not an administrator.' })
  @ApiOperation({ summary: 'Delete a procedure cost rule by ID' })
  @ApiResponse({ status: 200, type: ProcedureRuleResponseDto, example: procedureRuleResponseExample })
  @ApiResponse({ status: 404, description: 'Procedure rule not found.' })
  async delete(@Param() params: ProcedureRuleIdParamDto) {
    return this.procedureRulesService.deleteProcedureRule(params.id);
  }
}
