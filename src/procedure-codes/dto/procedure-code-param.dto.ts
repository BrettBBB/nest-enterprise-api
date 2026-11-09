import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { trimString } from '../../common/functions.js';
import { procedureCodeExample } from './procedure-code.examples.js';

export class ProcedureCodeParamDto {
  @ApiProperty({ description: 'CPT or HCPCS code', example: procedureCodeExample })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @Transform(trimString)
  code: string;
}
