import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { trimString } from '../../common/functions.js';
import { diagnosisCodeExample } from './diagnosis-code.examples.js';

export class DiagnosisCodeParamDto {
  @ApiProperty({ description: 'ICD-10-CM code', example: diagnosisCodeExample })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @Transform(trimString)
  code: string;
}
