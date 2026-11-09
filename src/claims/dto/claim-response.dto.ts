import { ApiProperty } from '@nestjs/swagger';
import { medicalCodeTypes } from '../../common/code-types.js';
import { claimOutcomes } from '../claim-grid.js';
import { claimResponseExample } from './claim.examples.js';

export class ClaimResponseDto {
  @ApiProperty({ example: claimResponseExample.id })
  id: string;

  @ApiProperty({ example: claimResponseExample.claimNumber })
  claimNumber: string;

  @ApiProperty({ example: claimResponseExample.codeType, enum: medicalCodeTypes })
  codeType: (typeof medicalCodeTypes)[number];

  @ApiProperty({ example: claimResponseExample.code })
  code: string;

  @ApiProperty({ example: claimResponseExample.category })
  category: string;

  @ApiProperty({ example: claimResponseExample.description })
  description: string;

  @ApiProperty({ example: claimResponseExample.serviceDate, format: 'date-time' })
  serviceDate: string;

  @ApiProperty({ example: claimResponseExample.billedCents, minimum: 0 })
  billedCents: number;

  @ApiProperty({ example: claimResponseExample.outcome, enum: claimOutcomes })
  outcome: (typeof claimOutcomes)[number];

  @ApiProperty({ example: claimResponseExample.procedureFlag, enum: claimOutcomes })
  procedureFlag: (typeof claimOutcomes)[number];

  @ApiProperty({ example: claimResponseExample.diagnosisFlag, enum: claimOutcomes })
  diagnosisFlag: (typeof claimOutcomes)[number];

  @ApiProperty({ example: claimResponseExample.createdAt, format: 'date-time' })
  createdAt: string;

  @ApiProperty({ example: claimResponseExample.updatedAt, format: 'date-time' })
  updatedAt: string;
}
