import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { trimString } from '../../common/functions.js';
import { procedureRuleResponseExample } from './procedure-rule.examples.js';

export class ProcedureRuleIdParamDto {
  @ApiProperty({ example: procedureRuleResponseExample.id })
  @IsString()
  @IsNotEmpty()
  @Transform(trimString)
  id: string;
}
