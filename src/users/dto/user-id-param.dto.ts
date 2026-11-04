import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { trimString } from '../../common/functions.js';
import { userIdExample } from './user.examples.js';

export class UserIdParamDto {
  @ApiProperty({
    description: 'User id',
    example: userIdExample,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(trimString)
  id: string;
}
