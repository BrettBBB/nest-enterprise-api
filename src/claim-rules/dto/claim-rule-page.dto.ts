import { ApiProperty } from '@nestjs/swagger';
import { claimRulePageExample } from './claim-rule.examples.js';
import { ClaimRuleResponseDto } from './claim-rule-response.dto.js';

export class ClaimRuleGridPageDto {
  @ApiProperty({ type: [ClaimRuleResponseDto], example: claimRulePageExample.rows })
  rows: ClaimRuleResponseDto[];

  @ApiProperty({ example: claimRulePageExample.rowCount, minimum: 0 })
  rowCount: number;
}
