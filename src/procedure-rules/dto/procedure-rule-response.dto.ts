import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { procedureCodeTypes } from '../../procedure-codes/procedure-code-grid.js';
import { procedureRuleResponseExample } from './procedure-rule.examples.js';

export class ProcedureRuleResponseDto {
  @ApiProperty({ example: procedureRuleResponseExample.id })
  id: string;

  @ApiProperty({ example: procedureRuleResponseExample.name })
  name: string;

  @ApiProperty({ example: procedureRuleResponseExample.description })
  description: string;

  @ApiPropertyOptional({ example: procedureRuleResponseExample.codeType, enum: procedureCodeTypes, nullable: true })
  codeType: (typeof procedureCodeTypes)[number] | null;

  @ApiPropertyOptional({ example: procedureRuleResponseExample.code, nullable: true })
  code: string | null;

  @ApiPropertyOptional({ example: procedureRuleResponseExample.category, nullable: true })
  category: string | null;

  @ApiProperty({ example: procedureRuleResponseExample.minStandardCost })
  minStandardCost: number;

  @ApiProperty({ example: procedureRuleResponseExample.enabled })
  enabled: boolean;

  @ApiProperty({ example: procedureRuleResponseExample.createdAt, format: 'date-time' })
  createdAt: string;

  @ApiProperty({ example: procedureRuleResponseExample.updatedAt, format: 'date-time' })
  updatedAt: string;
}
