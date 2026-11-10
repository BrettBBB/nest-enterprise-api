import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { trimString } from '../../common/functions.js';
import { askAssistantExample } from './assistant.examples.js';

export class AskAssistantDto {
  @ApiProperty({
    example: askAssistantExample.question,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  @Transform(trimString)
  question: string;
}
