import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { userIdExample } from './user.examples.js';

export class UserIdParamDto {
  @ApiProperty({
    description: 'User id',
    example: userIdExample,
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}
