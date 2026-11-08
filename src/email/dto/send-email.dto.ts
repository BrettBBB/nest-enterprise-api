import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';
import { trimString } from '../../common/functions.js';
import { sendEmailExample } from './email.examples.js';

export class SendEmailDto {
  @ApiProperty({ example: sendEmailExample.name, maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @Transform(trimString)
  name: string;

  @ApiProperty({ example: sendEmailExample.email, format: 'email' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(200)
  @Transform(trimString)
  email: string;

  @ApiProperty({ example: sendEmailExample.message, maxLength: 4000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  @Transform(trimString)
  message: string;
}
