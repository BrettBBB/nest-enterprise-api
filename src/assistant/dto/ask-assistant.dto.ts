import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
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

  @ApiProperty({
    required: false,
    example: '/medical-cost-control/overview',
    maxLength: 200,
    description: 'Path of the page the visitor is viewing.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Matches(/^\/[A-Za-z0-9/_-]*$/)
  @Transform(({ value }) => {
    const trimmed = trimString({ value });
    return trimmed === '' ? undefined : trimmed;
  })
  page?: string;
}
