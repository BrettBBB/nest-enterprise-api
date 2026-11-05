import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  Allow,
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

/**
 * One filter row from MUI X Data Grid `GridFilterModel.items`.
 * The operator is one of the grid's built-in operators for that column type.
 */
export class GridFilterItemDto {
  @ApiPropertyOptional({ example: 'firstName' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  field: string;

  @ApiPropertyOptional({ example: 'contains' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  operator: string;

  @ApiPropertyOptional({
    description: 'Omitted for isEmpty and isNotEmpty. An array for isAnyOf.',
  })
  @Allow()
  @IsOptional()
  value?: unknown;
}

/** MUI X Data Grid `GridFilterModel`. Every property is optional. */
export class GridFilterModelDto {
  @ApiPropertyOptional({ type: [GridFilterItemDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => GridFilterItemDto)
  items?: GridFilterItemDto[];

  @ApiPropertyOptional({ enum: ['and', 'or'], default: 'and' })
  @IsOptional()
  @IsIn(['and', 'or'])
  logicOperator?: 'and' | 'or';

  @ApiPropertyOptional({ type: [String], example: ['ada'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  quickFilterValues?: unknown[];

  @ApiPropertyOptional({ enum: ['and', 'or'], default: 'and' })
  @IsOptional()
  @IsIn(['and', 'or'])
  quickFilterLogicOperator?: 'and' | 'or';
}

/** One column from MUI X Data Grid `GridSortModel`. */
export class GridSortItemDto {
  @ApiPropertyOptional({ example: 'createdAt' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  field: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], nullable: true })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort?: 'asc' | 'desc' | null;
}

/** MUI X Data Grid `GridPaginationModel`. Omit it to return every matching row. */
export class GridPaginationModelDto {
  @ApiPropertyOptional({ minimum: 0, example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

/**
 * The list request shared by every table.
 * It follows MUI X `GridGetRowsParams`: pagination, sort, and filter are each optional,
 * and `sortModel` can name one column, several, or none.
 */
export class GridQueryDto {
  @ApiPropertyOptional({ type: GridPaginationModelDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => GridPaginationModelDto)
  paginationModel?: GridPaginationModelDto;

  @ApiPropertyOptional({ type: [GridSortItemDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => GridSortItemDto)
  sortModel?: GridSortItemDto[];

  @ApiPropertyOptional({ type: GridFilterModelDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => GridFilterModelDto)
  filterModel?: GridFilterModelDto;
}
