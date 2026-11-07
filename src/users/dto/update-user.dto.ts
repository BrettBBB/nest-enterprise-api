import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { trimString } from '../../common/functions.js';
import { createUserExample, updateUserExample } from './user.examples.js';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: updateUserExample.firstName })
  @IsOptional()
  @IsString()
  @Transform(trimString)
  firstName?: string;

  @ApiPropertyOptional({ example: updateUserExample.lastName })
  @IsOptional()
  @IsString()
  @Transform(trimString)
  lastName?: string;

  @ApiPropertyOptional({ example: updateUserExample.email, format: 'email' })
  @IsOptional()
  @IsEmail()
  @Transform(trimString)
  email?: string;

  @ApiPropertyOptional({
    example: createUserExample.password,
    minLength: 8,
    description: 'Password must be at least 8 characters long',
  })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password?: string;

  @ApiPropertyOptional({
    example: updateUserExample.age,
    minimum: 0,
    maximum: 120,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  @Type(() => Number)
  age?: number;

  @ApiPropertyOptional({ example: updateUserExample.isAdmin })
  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;
}
