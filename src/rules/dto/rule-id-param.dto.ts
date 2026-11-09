import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { trimString } from '../../common/functions.js';
import { ruleIdExample } from './rule.examples.js';

export class RuleIdParamDto {
  @ApiProperty({ example: ruleIdExample })
  @IsString()
  @IsNotEmpty()
  @Transform(trimString)
  id: string;
}
