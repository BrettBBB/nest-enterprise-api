import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { trimString } from '../../common/functions.js';
import { claimIdExample } from './claim.examples.js';

export class ClaimIdParamDto {
  @ApiProperty({ example: claimIdExample })
  @IsString()
  @IsNotEmpty()
  @Transform(trimString)
  id: string;
}
