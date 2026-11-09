import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { medicalCodeTypes } from '../../common/code-types.js';
import { ruleResponseExample } from './rule.examples.js';

export class RuleResponseDto {
  @ApiProperty({ example: ruleResponseExample.id })
  id: string;

  @ApiProperty({ example: ruleResponseExample.name })
  name: string;

  @ApiProperty({ example: ruleResponseExample.description })
  description: string;

  @ApiPropertyOptional({ example: ruleResponseExample.codeType, enum: medicalCodeTypes, nullable: true })
  codeType: (typeof medicalCodeTypes)[number] | null;

  @ApiPropertyOptional({ example: ruleResponseExample.code, nullable: true })
  code: string | null;

  @ApiPropertyOptional({ example: ruleResponseExample.category, nullable: true })
  category: string | null;

  @ApiProperty({ example: ruleResponseExample.minFeeCents, minimum: 0 })
  minFeeCents: number;

  @ApiProperty({ example: ruleResponseExample.enabled })
  enabled: boolean;

  @ApiProperty({ example: ruleResponseExample.createdAt, format: 'date-time' })
  createdAt: string;

  @ApiProperty({ example: ruleResponseExample.updatedAt, format: 'date-time' })
  updatedAt: string;
}
