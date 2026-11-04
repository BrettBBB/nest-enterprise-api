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
import { createUserExample } from './user.examples.js';

export class CreateUserDto {
  @ApiProperty({ example: createUserExample.firstName })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  firstName: string;

  @ApiProperty({ example: createUserExample.lastName })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  lastName: string;

  @ApiProperty({ example: createUserExample.email, format: 'email' })
  @IsEmail()
  @IsNotEmpty()
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
  @Type(() => Number) // Safely casts "32" to 32
  age?: number;
}
