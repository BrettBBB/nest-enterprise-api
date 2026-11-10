import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { trimString } from '../../common/functions.js';
import { medicalCodeTypes } from '../../common/code-types.js';
import { updateClaimRuleExample } from './claim-rule.examples.js';

function emptyToNull({ value }: { value: unknown }) {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export class UpdateClaimRuleDto {
  @ApiPropertyOptional({ maxLength: 80 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @Transform(trimString)
  name?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  @Transform(trimString)
  description?: string;

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

  @ApiPropertyOptional({ example: updateClaimRuleExample.minFeeCents, minimum: 0, maximum: 50_000_000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50_000_000)
  @Type(() => Number)
  minFeeCents?: number;

  @ApiPropertyOptional({ example: updateClaimRuleExample.enabled })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
