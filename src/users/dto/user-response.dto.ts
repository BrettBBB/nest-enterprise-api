import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { userResponseExample } from './user.examples.js';

export class UserResponseDto {
  @ApiProperty({ example: userResponseExample.id })
  id: string;

  @ApiProperty({ example: userResponseExample.firstName })
  firstName: string;

  @ApiProperty({ example: userResponseExample.lastName })
  lastName: string;

  @ApiProperty({ example: userResponseExample.email, format: 'email' })
  email: string;

  @ApiPropertyOptional({ example: userResponseExample.age })
  age?: number;

  @ApiProperty({ example: userResponseExample.isAdmin })
  isAdmin: boolean;

  @ApiProperty({ example: userResponseExample.createdAt, format: 'date-time' })
  createdAt: string;

  @ApiProperty({ example: userResponseExample.updatedAt, format: 'date-time' })
  updatedAt: string;
}
