import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { trimString } from '../../common/functions.js';
import { loginExample } from './auth.examples.js';

export class LoginDto {
  @ApiProperty({ example: loginExample.email, format: 'email' })
  @IsEmail()
  @IsNotEmpty()
  @Transform(trimString)
  email: string;

  @ApiProperty({
    example: loginExample.password,
    minLength: 8,
    description: 'Password must be at least 8 characters long',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}
