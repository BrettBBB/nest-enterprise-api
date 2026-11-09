import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { diagnosisRuleResponseExample } from './diagnosis-rule.examples.js';

export class DiagnosisRuleResponseDto {
  @ApiProperty({ example: diagnosisRuleResponseExample.id })
  id: string;

  @ApiProperty({ example: diagnosisRuleResponseExample.name })
  name: string;

  @ApiProperty({ example: diagnosisRuleResponseExample.description })
  description: string;

  @ApiPropertyOptional({ example: diagnosisRuleResponseExample.code, nullable: true })
  code: string | null;

  @ApiPropertyOptional({ example: diagnosisRuleResponseExample.category, nullable: true })
  category: string | null;

  @ApiPropertyOptional({ example: diagnosisRuleResponseExample.laterality, nullable: true })
  laterality: string | null;

  @ApiProperty({ example: diagnosisRuleResponseExample.requireHccEligible })
  requireHccEligible: boolean;

  @ApiProperty({ example: diagnosisRuleResponseExample.enabled })
  enabled: boolean;

  @ApiProperty({ example: diagnosisRuleResponseExample.createdAt, format: 'date-time' })
  createdAt: string;

  @ApiProperty({ example: diagnosisRuleResponseExample.updatedAt, format: 'date-time' })
  updatedAt: string;
}
