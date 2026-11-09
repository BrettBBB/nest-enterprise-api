import { ApiProperty } from '@nestjs/swagger';
import { DiagnosisRuleResponseDto } from './diagnosis-rule-response.dto.js';
import { diagnosisRulePageExample } from './diagnosis-rule.examples.js';

export class DiagnosisRuleGridPageDto {
  @ApiProperty({ type: [DiagnosisRuleResponseDto], example: diagnosisRulePageExample.rows })
  rows: DiagnosisRuleResponseDto[];

  @ApiProperty({ example: diagnosisRulePageExample.rowCount, minimum: 0 })
  rowCount: number;
}
