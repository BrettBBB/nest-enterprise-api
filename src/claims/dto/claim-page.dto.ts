import { ApiProperty } from '@nestjs/swagger';
import { claimPageExample } from './claim.examples.js';
import { ClaimResponseDto } from './claim-response.dto.js';

export class ClaimGridPageDto {
  @ApiProperty({ type: [ClaimResponseDto], example: claimPageExample.rows })
  rows: ClaimResponseDto[];

  @ApiProperty({ example: claimPageExample.rowCount, minimum: 0 })
  rowCount: number;
}
