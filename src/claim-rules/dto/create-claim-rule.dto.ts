import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { trimString } from '../../common/functions.js';
import { medicalCodeTypes } from '../../common/code-types.js';
import { createClaimRuleExample } from './claim-rule.examples.js';

function emptyToNull({ value }: { value: unknown }) {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export class CreateClaimRuleDto {
  @ApiProperty({ example: createClaimRuleExample.name, maxLength: 80 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  @Transform(trimString)
  name: string;

  @ApiProperty({ example: createClaimRuleExample.description, maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  @Transform(trimString)
  description: string;

  @ApiPropertyOptional({ enum: medicalCodeTypes, nullable: true })
  @IsOptional()
  @IsIn(medicalCodeTypes)
  @Transform(emptyToNull)
  codeType?: (typeof medicalCodeTypes)[number] | null;

  @ApiPropertyOptional({ maxLength: 10, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  @Transform(emptyToNull)
  code?: string | null;

  @ApiPropertyOptional({ maxLength: 80, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Transform(emptyToNull)
  category?: string | null;

  @ApiProperty({ example: createClaimRuleExample.minFeeCents, minimum: 0, maximum: 50_000_000 })
  @IsInt()
  @Min(0)
  @Max(50_000_000)
  @Type(() => Number)
  minFeeCents: number;

  @ApiPropertyOptional({ example: createClaimRuleExample.enabled, default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
