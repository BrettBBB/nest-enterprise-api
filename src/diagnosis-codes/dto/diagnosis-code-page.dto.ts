import { ApiProperty } from '@nestjs/swagger';
import { DiagnosisCodeResponseDto } from './diagnosis-code-response.dto.js';
import { diagnosisCodePageExample } from './diagnosis-code.examples.js';

export class DiagnosisCodeGridPageDto {
  @ApiProperty({ type: [DiagnosisCodeResponseDto], example: diagnosisCodePageExample.rows })
  rows: DiagnosisCodeResponseDto[];

  @ApiProperty({ example: diagnosisCodePageExample.rowCount, minimum: 0 })
  rowCount: number;
}
