import { ApiProperty } from '@nestjs/swagger';
import { ProcedureCodeResponseDto } from './procedure-code-response.dto.js';
import { procedureCodePageExample } from './procedure-code.examples.js';

export class ProcedureCodeGridPageDto {
  @ApiProperty({ type: [ProcedureCodeResponseDto], example: procedureCodePageExample.rows })
  rows: ProcedureCodeResponseDto[];

  @ApiProperty({ example: procedureCodePageExample.rowCount, minimum: 0 })
  rowCount: number;
}
