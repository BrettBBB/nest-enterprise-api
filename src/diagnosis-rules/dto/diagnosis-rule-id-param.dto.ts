import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { trimString } from '../../common/functions.js';
import { diagnosisRuleResponseExample } from './diagnosis-rule.examples.js';

export class DiagnosisRuleIdParamDto {
  @ApiProperty({ example: diagnosisRuleResponseExample.id })
  @IsString()
  @IsNotEmpty()
  @Transform(trimString)
  id: string;
}
