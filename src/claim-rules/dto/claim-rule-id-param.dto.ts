import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { trimString } from '../../common/functions.js';
import { claimRuleIdExample } from './claim-rule.examples.js';

export class ClaimRuleIdParamDto {
  @ApiProperty({ example: claimRuleIdExample })
  @IsString()
  @IsNotEmpty()
  @Transform(trimString)
  id: string;
}
