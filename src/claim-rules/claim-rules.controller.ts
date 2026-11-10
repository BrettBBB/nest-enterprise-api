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
import { CreateClaimRuleDto } from './dto/create-claim-rule.dto.js';
import { ClaimRuleGridPageDto } from './dto/claim-rule-page.dto.js';
import { ClaimRuleIdParamDto } from './dto/claim-rule-id-param.dto.js';
import { ClaimRuleResponseDto } from './dto/claim-rule-response.dto.js';
import {
  createClaimRuleExample,
  claimRulePageExample,
  claimRuleResponseExample,
  updateClaimRuleExample,
} from './dto/claim-rule.examples.js';
import { UpdateClaimRuleDto } from './dto/update-claim-rule.dto.js';
import { claimRuleEnumValues, claimRuleGridFields, claimRuleQuickFilterFields } from './claim-rule-grid.js';
import { toClaimRuleCreateInput, toClaimRuleUpdateInput } from './claim-rule-input.js';
import { ClaimRulesService } from './claim-rules.service.js';

@ApiTags('claim-rules')
@Controller('claim-rules')
export class ClaimRulesController {
  constructor(private readonly claimRulesService: ClaimRulesService) {}

  @Post()
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'The access token is not an administrator.' })
  @ApiOperation({ summary: 'Create a claim rule' })
  @ApiBody({
    type: CreateClaimRuleDto,
    examples: { sample: { summary: 'High dollar claim', value: createClaimRuleExample } },
  })
  @ApiResponse({ status: 201, type: ClaimRuleResponseDto, example: claimRuleResponseExample })
  @ApiResponse({ status: 400, description: 'Invalid input or validation failed.' })
  @ApiResponse({ status: 409, description: 'That rule name already exists.' })
  async create(@Body() dto: CreateClaimRuleDto) {
    return this.claimRulesService.createClaimRule(toClaimRuleCreateInput(dto));
  }

  @Get()
  @ApiOperation({
    summary: 'List claim rules',
    description:
      'The grid query pages, sorts, and filters in the database. A rule matches a claim at or above its minimum fee when the code type, code, and category it sets also match.',
  })
  @ApiQuery({
    name: 'grid',
    required: false,
    description: 'JSON GridGetRowsParams: paginationModel, sortModel, and filterModel are optional.',
  })
  @ApiResponse({ status: 200, type: ClaimRuleGridPageDto, example: claimRulePageExample })
  @ApiResponse({ status: 400, description: 'Invalid filter, sort, or page.' })
  async findAll(@Query('grid') grid?: string) {
    const query = await parseGridQuery(grid);
    return this.claimRulesService.findClaimRules(
      toGridListArgs(query, {
        fields: claimRuleGridFields,
        enumValues: claimRuleEnumValues,
        quickFilterFields: claimRuleQuickFilterFields,
      }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a claim rule by ID' })
  @ApiResponse({ status: 200, type: ClaimRuleResponseDto, example: claimRuleResponseExample })
  @ApiResponse({ status: 404, description: 'Rule not found.' })
  async findOne(@Param() params: ClaimRuleIdParamDto) {
    return this.claimRulesService.findClaimRuleById(params.id);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'The access token is not an administrator.' })
  @ApiOperation({ summary: 'Update a claim rule by ID' })
  @ApiBody({
    type: UpdateClaimRuleDto,
    examples: { sample: { summary: 'Sample update', value: updateClaimRuleExample } },
  })
  @ApiResponse({
    status: 200,
    type: ClaimRuleResponseDto,
    example: { ...claimRuleResponseExample, ...updateClaimRuleExample },
  })
  @ApiResponse({ status: 400, description: 'Invalid input or validation failed.' })
  @ApiResponse({ status: 404, description: 'Rule not found.' })
  @ApiResponse({ status: 409, description: 'That rule name already exists.' })
  async update(@Param() params: ClaimRuleIdParamDto, @Body() dto: UpdateClaimRuleDto) {
    return this.claimRulesService.updateClaimRule(params.id, toClaimRuleUpdateInput(dto));
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'The access token is not an administrator.' })
  @ApiOperation({ summary: 'Delete a claim rule by ID' })
  @ApiResponse({ status: 200, type: ClaimRuleResponseDto, example: claimRuleResponseExample })
  @ApiResponse({ status: 404, description: 'Rule not found.' })
  async delete(@Param() params: ClaimRuleIdParamDto) {
    return this.claimRulesService.deleteClaimRule(params.id);
  }
}
