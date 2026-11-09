import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
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
import { CreateRuleDto } from './dto/create-rule.dto.js';
import { RuleGridPageDto } from './dto/rule-page.dto.js';
import { RuleIdParamDto } from './dto/rule-id-param.dto.js';
import { RuleResponseDto } from './dto/rule-response.dto.js';
import {
  createRuleExample,
  rulePageExample,
  ruleResponseExample,
  updateRuleExample,
} from './dto/rule.examples.js';
import { UpdateRuleDto } from './dto/update-rule.dto.js';
import { ruleEnumValues, ruleGridFields, ruleQuickFilterFields } from './rule-grid.js';
import { toRuleCreateInput, toRuleUpdateInput } from './rule-input.js';
import { RulesService } from './rules.service.js';

@ApiTags('rule-definitions')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
@ApiForbiddenResponse({ description: 'The access token is not an administrator.' })
@UseGuards(AdminGuard)
@Controller('rule-definitions')
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a cost-management rule' })
  @ApiBody({
    type: CreateRuleDto,
    examples: { sample: { summary: 'High dollar claim', value: createRuleExample } },
  })
  @ApiResponse({ status: 201, type: RuleResponseDto, example: ruleResponseExample })
  @ApiResponse({ status: 400, description: 'Invalid input or validation failed.' })
  @ApiResponse({ status: 409, description: 'That rule name already exists.' })
  async create(@Body() dto: CreateRuleDto) {
    return this.rulesService.createRule(toRuleCreateInput(dto));
  }

  @Get()
  @ApiOperation({
    summary: 'List cost-management rules',
    description:
      'The grid query pages, sorts, and filters in the database. A rule matches a claim at or above its minimum fee when the code type, code, and category it sets also match.',
  })
  @ApiQuery({
    name: 'grid',
    required: false,
    description: 'JSON GridGetRowsParams: paginationModel, sortModel, and filterModel are optional.',
  })
  @ApiResponse({ status: 200, type: RuleGridPageDto, example: rulePageExample })
  @ApiResponse({ status: 400, description: 'Invalid filter, sort, or page.' })
  async findAll(@Query('grid') grid?: string) {
    const query = await parseGridQuery(grid);
    return this.rulesService.findRules(
      toGridListArgs(query, {
        fields: ruleGridFields,
        enumValues: ruleEnumValues,
        quickFilterFields: ruleQuickFilterFields,
      }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a rule by ID' })
  @ApiResponse({ status: 200, type: RuleResponseDto, example: ruleResponseExample })
  @ApiResponse({ status: 404, description: 'Rule not found.' })
  async findOne(@Param() params: RuleIdParamDto) {
    return this.rulesService.findRuleById(params.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a rule by ID' })
  @ApiBody({
    type: UpdateRuleDto,
    examples: { sample: { summary: 'Sample update', value: updateRuleExample } },
  })
  @ApiResponse({
    status: 200,
    type: RuleResponseDto,
    example: { ...ruleResponseExample, ...updateRuleExample },
  })
  @ApiResponse({ status: 400, description: 'Invalid input or validation failed.' })
  @ApiResponse({ status: 404, description: 'Rule not found.' })
  @ApiResponse({ status: 409, description: 'That rule name already exists.' })
  async update(@Param() params: RuleIdParamDto, @Body() dto: UpdateRuleDto) {
    return this.rulesService.updateRule(params.id, toRuleUpdateInput(dto));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a rule by ID' })
  @ApiResponse({ status: 200, type: RuleResponseDto, example: ruleResponseExample })
  @ApiResponse({ status: 404, description: 'Rule not found.' })
  async delete(@Param() params: RuleIdParamDto) {
    return this.rulesService.deleteRule(params.id);
  }
}
