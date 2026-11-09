import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { trimString } from '../../common/functions.js';
import { createDiagnosisRuleExample } from './diagnosis-rule.examples.js';

function emptyToNull({ value }: { value: unknown }) {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export class CreateDiagnosisRuleDto {
  @ApiProperty({ example: createDiagnosisRuleExample.name, maxLength: 80 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  @Transform(trimString)
  name: string;

  @ApiProperty({ example: createDiagnosisRuleExample.description, maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  @Transform(trimString)
  description: string;

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

  @ApiPropertyOptional({ example: createDiagnosisRuleExample.requireHccEligible, default: false })
  @IsOptional()
  @IsBoolean()
  requireHccEligible?: boolean;

  @ApiPropertyOptional({ example: createDiagnosisRuleExample.enabled, default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
