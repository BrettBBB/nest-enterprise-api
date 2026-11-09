import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { diagnosisCodeTypes } from '../diagnosis-code-grid.js';
import { diagnosisCodeResponseExample } from './diagnosis-code.examples.js';

export class DiagnosisCodeResponseDto {
  @ApiProperty({ example: diagnosisCodeResponseExample.code })
  code: string;

  @ApiProperty({ example: diagnosisCodeResponseExample.codeType, enum: diagnosisCodeTypes })
  codeType: (typeof diagnosisCodeTypes)[number];

  @ApiPropertyOptional({ example: diagnosisCodeResponseExample.category, nullable: true })
  category: string | null;

  @ApiProperty({ example: diagnosisCodeResponseExample.shortDescription })
  shortDescription: string;

  @ApiProperty({ example: diagnosisCodeResponseExample.longDescription })
  longDescription: string;

  @ApiProperty({ example: diagnosisCodeResponseExample.isBillable })
  isBillable: boolean;

  @ApiProperty({ example: diagnosisCodeResponseExample.requires7thCharacter })
  requires7thCharacter: boolean;

  @ApiPropertyOptional({ example: diagnosisCodeResponseExample.laterality, nullable: true })
  laterality: string | null;

  @ApiProperty({ example: diagnosisCodeResponseExample.episodeOfCare })
  episodeOfCare: boolean;

  @ApiProperty({ example: diagnosisCodeResponseExample.isHccEligible })
  isHccEligible: boolean;

  @ApiProperty({ example: diagnosisCodeResponseExample.effectiveDate, format: 'date-time' })
  effectiveDate: string;

  @ApiProperty({ example: diagnosisCodeResponseExample.createdAt, format: 'date-time' })
  createdAt: string;

  @ApiProperty({ example: diagnosisCodeResponseExample.updatedAt, format: 'date-time' })
  updatedAt: string;
}
