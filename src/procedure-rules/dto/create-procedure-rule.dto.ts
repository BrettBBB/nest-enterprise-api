import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { trimString } from '../../common/functions.js';
import { procedureCodeTypes } from '../../procedure-codes/procedure-code-grid.js';
import { createProcedureRuleExample } from './procedure-rule.examples.js';

function emptyToNull({ value }: { value: unknown }) {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export class CreateProcedureRuleDto {
  @ApiProperty({ example: createProcedureRuleExample.name, maxLength: 80 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  @Transform(trimString)
  name: string;

  @ApiProperty({ example: createProcedureRuleExample.description, maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  @Transform(trimString)
  description: string;

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

  @ApiProperty({ example: createProcedureRuleExample.minStandardCost, minimum: 0, maximum: 99_999_999.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99_999_999.99)
  @Type(() => Number)
  minStandardCost: number;

  @ApiPropertyOptional({ example: createProcedureRuleExample.enabled, default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
