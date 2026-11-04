import { IsEmail, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { updateUserExample } from './user.examples.js';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: updateUserExample.firstName })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  firstName?: string;

  @ApiPropertyOptional({ example: updateUserExample.lastName })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  lastName?: string;

  @ApiPropertyOptional({ example: updateUserExample.email, format: 'email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'ChangeMe123',
    minLength: 8,
    description: 'Password must be at least 8 characters long',
  })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password?: string;

  @ApiPropertyOptional({ example: updateUserExample.age, minimum: 0, maximum: 120 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  age?: number;
}
