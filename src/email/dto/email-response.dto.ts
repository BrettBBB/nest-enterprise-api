import { ApiProperty } from '@nestjs/swagger';
import { emailResponseExample } from './email.examples.js';

export class EmailResponseDto {
  @ApiProperty({ example: emailResponseExample.id })
  id: string;
}
