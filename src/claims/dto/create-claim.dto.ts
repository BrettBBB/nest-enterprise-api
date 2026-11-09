import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { trimString } from '../../common/functions.js';
import { medicalCodeTypes } from '../../common/code-types.js';
import { createClaimExample } from './claim.examples.js';

export class CreateClaimDto {
  @ApiProperty({ example: createClaimExample.claimNumber, maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9-]{4,20}$/, { message: 'claimNumber must be 4-20 letters, digits, or dashes' })
  @Transform(trimString)
  claimNumber: string;

  @ApiProperty({ example: createClaimExample.codeType, enum: medicalCodeTypes })
  @IsIn(medicalCodeTypes)
  codeType: (typeof medicalCodeTypes)[number];

  @ApiProperty({ example: createClaimExample.code, maxLength: 10 })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9.]{2,10}$/, { message: 'code must be 2-10 letters, digits, or dots' })
  @Transform(trimString)
  code: string;

  @ApiProperty({ example: createClaimExample.serviceDate, format: 'date' })
  @IsDateString()
  serviceDate: string;

  @ApiProperty({ example: createClaimExample.billedCents, minimum: 0, maximum: 50_000_000 })
  @IsInt()
  @Min(0)
  @Max(50_000_000)
  @Type(() => Number)
  billedCents: number;
}
