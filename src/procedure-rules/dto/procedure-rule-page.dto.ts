import { ApiProperty } from '@nestjs/swagger';
import { ProcedureRuleResponseDto } from './procedure-rule-response.dto.js';
import { procedureRulePageExample } from './procedure-rule.examples.js';

export class ProcedureRuleGridPageDto {
  @ApiProperty({ type: [ProcedureRuleResponseDto], example: procedureRulePageExample.rows })
  rows: ProcedureRuleResponseDto[];

  @ApiProperty({ example: procedureRulePageExample.rowCount, minimum: 0 })
  rowCount: number;
}
