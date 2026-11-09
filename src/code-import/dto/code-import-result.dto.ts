import { ApiProperty } from '@nestjs/swagger';
import { codeImportResultExample } from './code-import.examples.js';

export class CodeImportResultDto {
  @ApiProperty({ example: codeImportResultExample.imported, minimum: 0 })
  imported: number;
}
