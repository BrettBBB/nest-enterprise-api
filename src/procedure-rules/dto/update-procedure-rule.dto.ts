import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { trimString } from '../../common/functions.js';
import { procedureCodeTypes } from '../../procedure-codes/procedure-code-grid.js';
import { updateProcedureRuleExample } from './procedure-rule.examples.js';

function emptyToNull({ value }: { value: unknown }) {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export class UpdateProcedureRuleDto {
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

  @ApiPropertyOptional({ enum: procedureCodeTypes, nullable: true })
  @IsOptional()
  @IsIn(procedureCodeTypes)
  @Transform(emptyToNull)
  codeType?: (typeof procedureCodeTypes)[number] | null;

  @ApiPropertyOptional({ maxLength: 10, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  @Transform(emptyToNull)
  code?: string | null;

  @ApiPropertyOptional({ maxLength: 100, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(emptyToNull)
  category?: string | null;

  @ApiPropertyOptional({ example: updateProcedureRuleExample.minStandardCost, minimum: 0, maximum: 99_999_999.99 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99_999_999.99)
  @Type(() => Number)
  minStandardCost?: number;

  @ApiPropertyOptional({ example: updateProcedureRuleExample.enabled })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
