import { ApiProperty } from '@nestjs/swagger';
import { rulePageExample } from './rule.examples.js';
import { RuleResponseDto } from './rule-response.dto.js';

export class RuleGridPageDto {
  @ApiProperty({ type: [RuleResponseDto], example: rulePageExample.rows })
  rows: RuleResponseDto[];

  @ApiProperty({ example: rulePageExample.rowCount, minimum: 0 })
  rowCount: number;
}
