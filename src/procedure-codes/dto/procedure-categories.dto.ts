import { ApiProperty } from '@nestjs/swagger';
import { procedureCategoriesExample } from './procedure-code.examples.js';

export class ProcedureCategoriesDto {
  @ApiProperty({ example: procedureCategoriesExample.categories, type: [String] })
  categories: string[];
}
