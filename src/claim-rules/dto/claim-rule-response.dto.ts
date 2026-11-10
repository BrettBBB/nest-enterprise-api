import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { medicalCodeTypes } from '../../common/code-types.js';
import { claimRuleResponseExample } from './claim-rule.examples.js';

export class ClaimRuleResponseDto {
  @ApiProperty({ example: claimRuleResponseExample.id })
  id: string;

  @ApiProperty({ example: claimRuleResponseExample.name })
  name: string;

  @ApiProperty({ example: claimRuleResponseExample.description })
  description: string;

  @ApiPropertyOptional({ example: claimRuleResponseExample.codeType, enum: medicalCodeTypes, nullable: true })
  codeType: (typeof medicalCodeTypes)[number] | null;

  @ApiPropertyOptional({ example: claimRuleResponseExample.code, nullable: true })
  code: string | null;

  @ApiPropertyOptional({ example: claimRuleResponseExample.category, nullable: true })
  category: string | null;

  @ApiProperty({ example: claimRuleResponseExample.minFeeCents, minimum: 0 })
  minFeeCents: number;

  @ApiProperty({ example: claimRuleResponseExample.enabled })
  enabled: boolean;

  @ApiProperty({ example: claimRuleResponseExample.createdAt, format: 'date-time' })
  createdAt: string;

  @ApiProperty({ example: claimRuleResponseExample.updatedAt, format: 'date-time' })
  updatedAt: string;
}
