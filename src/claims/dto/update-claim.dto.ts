import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { trimString } from '../../common/functions.js';
import { medicalCodeTypes } from '../../common/code-types.js';
import { updateClaimExample } from './claim.examples.js';

export class UpdateClaimDto {
  @ApiPropertyOptional({ maxLength: 20 })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z0-9-]{4,20}$/, { message: 'claimNumber must be 4-20 letters, digits, or dashes' })
  @Transform(trimString)
  claimNumber?: string;

  @ApiPropertyOptional({ enum: medicalCodeTypes })
  @IsOptional()
  @IsIn(medicalCodeTypes)
  codeType?: (typeof medicalCodeTypes)[number];

  @ApiPropertyOptional({ maxLength: 10 })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  @Matches(/^[A-Za-z0-9.]{2,10}$/, { message: 'code must be 2-10 letters, digits, or dots' })
  @Transform(trimString)
  code?: string;

  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsDateString()
  serviceDate?: string;

  @ApiPropertyOptional({ example: updateClaimExample.billedCents, minimum: 0, maximum: 50_000_000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50_000_000)
  @Type(() => Number)
  billedCents?: number;
}
