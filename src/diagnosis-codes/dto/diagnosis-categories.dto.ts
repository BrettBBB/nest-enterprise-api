import { ApiProperty } from '@nestjs/swagger';
import { diagnosisCategoriesExample } from './diagnosis-code.examples.js';

export class DiagnosisCategoriesDto {
  @ApiProperty({ example: diagnosisCategoriesExample.categories, type: [String] })
  categories: string[];
}
