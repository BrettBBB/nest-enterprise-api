import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { trimString } from '../../common/functions.js';
import { createUserExample } from './user.examples.js';

export class CreateUserDto {
  @ApiProperty({ example: createUserExample.firstName })
  @IsString()
  @IsNotEmpty()
  @Transform(trimString)
  firstName: string;

  @ApiProperty({ example: createUserExample.lastName })
  @IsString()
  @IsNotEmpty()
  @Transform(trimString)
  lastName: string;

  @ApiProperty({ example: createUserExample.email, format: 'email' })
  @IsEmail()
  @IsNotEmpty()
  @Transform(trimString)
  email: string;

  @ApiProperty({
    example: createUserExample.password,
    minLength: 8,
    description: 'Password must be at least 8 characters long',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiPropertyOptional({
    example: createUserExample.age,
    minimum: 0,
    maximum: 120,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  @Type(() => Number)
  age?: number;
}
