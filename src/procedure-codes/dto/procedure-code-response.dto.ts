import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { procedureCodeResponseExample } from './procedure-code.examples.js';
import { procedureCodeTypes } from '../procedure-code-grid.js';

export class ProcedureCodeResponseDto {
  @ApiProperty({ example: procedureCodeResponseExample.code })
  code: string;

  @ApiProperty({ example: procedureCodeResponseExample.codeType, enum: procedureCodeTypes })
  codeType: (typeof procedureCodeTypes)[number];

  @ApiPropertyOptional({ example: procedureCodeResponseExample.category, nullable: true })
  category: string | null;

  @ApiProperty({ example: procedureCodeResponseExample.shortDescription })
  shortDescription: string;

  @ApiProperty({ example: procedureCodeResponseExample.longDescription })
  longDescription: string;

  @ApiPropertyOptional({ example: procedureCodeResponseExample.workRvu, nullable: true })
  workRvu: number | null;

  @ApiPropertyOptional({ example: procedureCodeResponseExample.peRvu, nullable: true })
  peRvu: number | null;

  @ApiPropertyOptional({ example: procedureCodeResponseExample.mpRvu, nullable: true })
  mpRvu: number | null;

  @ApiPropertyOptional({ example: procedureCodeResponseExample.totalRvu, nullable: true })
  totalRvu: number | null;

  @ApiPropertyOptional({ example: procedureCodeResponseExample.standardCost, nullable: true })
  standardCost: number | null;

  @ApiProperty({ example: procedureCodeResponseExample.effectiveDate, format: 'date-time' })
  effectiveDate: string;

  @ApiProperty({ example: procedureCodeResponseExample.createdAt, format: 'date-time' })
  createdAt: string;

  @ApiProperty({ example: procedureCodeResponseExample.updatedAt, format: 'date-time' })
  updatedAt: string;
}
