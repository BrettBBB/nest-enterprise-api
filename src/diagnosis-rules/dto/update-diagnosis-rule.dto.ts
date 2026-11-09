import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { trimString } from '../../common/functions.js';
import { updateDiagnosisRuleExample } from './diagnosis-rule.examples.js';

function emptyToNull({ value }: { value: unknown }) {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export class UpdateDiagnosisRuleDto {
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

  @ApiPropertyOptional({ maxLength: 20, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Transform(emptyToNull)
  laterality?: string | null;

  @ApiPropertyOptional({ example: updateDiagnosisRuleExample.requireHccEligible })
  @IsOptional()
  @IsBoolean()
  requireHccEligible?: boolean;

  @ApiPropertyOptional({ example: updateDiagnosisRuleExample.enabled })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
