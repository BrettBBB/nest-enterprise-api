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
import { claimEnumValues, claimGridFields, claimQuickFilterFields } from './claim-grid.js';
import { toClaimCreateInput, toClaimUpdateInput } from './claim-input.js';
import { ClaimsService } from './claims.service.js';
import { CreateClaimDto } from './dto/create-claim.dto.js';
import { ClaimGridPageDto } from './dto/claim-page.dto.js';
import { ClaimIdParamDto } from './dto/claim-id-param.dto.js';
import { ClaimResponseDto } from './dto/claim-response.dto.js';
import {
  claimPageExample,
  claimResponseExample,
  createClaimExample,
  updateClaimExample,
} from './dto/claim.examples.js';
import { UpdateClaimDto } from './dto/update-claim.dto.js';

@ApiTags('claims')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
@ApiForbiddenResponse({ description: 'The access token is not an administrator.' })
@UseGuards(AdminGuard)
@Controller('claims')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a claim and score it against the rules' })
  @ApiBody({
    type: CreateClaimDto,
    examples: { sample: { summary: 'High dollar office visit', value: createClaimExample } },
  })
  @ApiResponse({ status: 201, type: ClaimResponseDto, example: claimResponseExample })
  @ApiResponse({ status: 400, description: 'Invalid input, or the medical code is not in the catalog.' })
  @ApiResponse({ status: 409, description: 'That claim number already exists.' })
  async create(@Body() dto: CreateClaimDto) {
    return this.claimsService.createClaim(toClaimCreateInput(dto));
  }

  @Get()
  @ApiOperation({
    summary: 'List claims',
    description:
      'The grid query pages, sorts, and filters in the database, including outcome. Outcome is TRIGGERED when a saved rule matches the claim, and PASSED otherwise.',
  })
  @ApiQuery({
    name: 'grid',
    required: false,
    description: 'JSON GridGetRowsParams: paginationModel, sortModel, and filterModel are optional.',
  })
  @ApiResponse({ status: 200, type: ClaimGridPageDto, example: claimPageExample })
  @ApiResponse({ status: 400, description: 'Invalid filter, sort, or page.' })
  async findAll(@Query('grid') grid?: string) {
    const query = await parseGridQuery(grid);
    return this.claimsService.findClaims(
      toGridListArgs(query, {
        fields: claimGridFields,
        enumValues: claimEnumValues,
        quickFilterFields: claimQuickFilterFields,
      }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a claim by ID' })
  @ApiResponse({ status: 200, type: ClaimResponseDto, example: claimResponseExample })
  @ApiResponse({ status: 404, description: 'Claim not found.' })
  async findOne(@Param() params: ClaimIdParamDto) {
    return this.claimsService.findClaimById(params.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a claim and score it again' })
  @ApiBody({
    type: UpdateClaimDto,
    examples: { sample: { summary: 'Lower the billed amount', value: updateClaimExample } },
  })
  @ApiResponse({ status: 200, type: ClaimResponseDto, example: { ...claimResponseExample, ...updateClaimExample, outcome: 'PASSED' } })
  @ApiResponse({ status: 400, description: 'Invalid input, or the medical code is not in the catalog.' })
  @ApiResponse({ status: 404, description: 'Claim not found.' })
  @ApiResponse({ status: 409, description: 'That claim number already exists.' })
  async update(@Param() params: ClaimIdParamDto, @Body() dto: UpdateClaimDto) {
    return this.claimsService.updateClaim(params.id, toClaimUpdateInput(dto));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a claim by ID' })
  @ApiResponse({ status: 200, type: ClaimResponseDto, example: claimResponseExample })
  @ApiResponse({ status: 404, description: 'Claim not found.' })
  async delete(@Param() params: ClaimIdParamDto) {
    return this.claimsService.deleteClaim(params.id);
  }
}
