import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, type ValidationError } from 'class-validator';
import { GridQueryDto } from './grid-query.dto.js';

export const gridFieldTypes = ['string', 'number', 'date', 'decimal', 'boolean', 'enum'] as const;
export type GridFieldType = (typeof gridFieldTypes)[number];

export type GridFields = Readonly<Record<string, GridFieldType>>;

export type GridListOptions = {
  fields: GridFields;
  /** Allowed values for each `enum` column. `is`, `not`, and `isAnyOf` match these exactly. */
  enumValues?: Readonly<Record<string, readonly string[]>>;
  quickFilterFields?: readonly string[];
};

export type GridListArgs = {
  where: Record<string, unknown>;
  orderBy?: Array<Record<string, 'asc' | 'desc'>>;
  skip?: number;
  take?: number;
};

const textOperators: Record<string, 'contains' | 'startsWith' | 'endsWith' | 'equals'> = {
  contains: 'contains',
  doesNotContain: 'contains',
  startsWith: 'startsWith',
  endsWith: 'endsWith',
  equals: 'equals',
  doesNotEqual: 'equals',
};

const negatedOperators = new Set(['doesNotContain', 'doesNotEqual', 'not', '!=']);

const comparisons: Record<string, 'equals' | 'gt' | 'gte' | 'lt' | 'lte'> = {
  '=': 'equals',
  is: 'equals',
  '!=': 'equals',
  not: 'equals',
  '>': 'gt',
  after: 'gt',
  '>=': 'gte',
  onOrAfter: 'gte',
  '<': 'lt',
  before: 'lt',
  '<=': 'lte',
  onOrBefore: 'lte',
};

export async function parseGridQuery(value: unknown): Promise<GridQueryDto> {
  const plain = decodeGridQuery(value);
  const dto = plainToInstance(GridQueryDto, plain);
  const errors = await validate(dto, { whitelist: true });
  if (errors.length > 0) {
    throw new BadRequestException(validationMessages(errors));
  }
  return dto;
}

export function toGridListArgs(
  query: GridQueryDto,
  options: GridListOptions,
): GridListArgs {
  const columnFilters = (query.filterModel?.items ?? []).flatMap((item) => {
    const clause = filterClause(item.field, item.operator, item.value, options);
    return clause ? [clause] : [];
  });
  const logic = query.filterModel?.logicOperator === 'or' ? 'OR' : 'AND';
  const columns =
    columnFilters.length === 0
      ? undefined
      : columnFilters.length === 1
        ? columnFilters[0]
        : { [logic]: columnFilters };
  const quick = quickFilterWhere(query, options);
  const parts = [columns, quick].filter(
    (part): part is Record<string, unknown> => part !== undefined,
  );

  const orderBy = (query.sortModel ?? []).flatMap((item) => {
    if (item.sort !== 'asc' && item.sort !== 'desc') {
      return [];
    }
    assertField(item.field, options.fields, 'sort');
    return [{ [item.field]: item.sort }];
  });

  const args: GridListArgs = {
    where: parts.length === 0 ? {} : parts.length === 1 ? parts[0] : { AND: parts },
  };
  if (orderBy.length > 0) {
    args.orderBy = orderBy;
  }
  if (query.paginationModel) {
    const page = query.paginationModel.page ?? 0;
    const pageSize = query.paginationModel.pageSize ?? 100;
    args.skip = page * pageSize;
    args.take = pageSize;
  }
  return args;
}

function decodeGridQuery(value: unknown): object {
  if (value == null || value === '') {
    return {};
  }
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value;
  }
  if (typeof value !== 'string') {
    throw new BadRequestException('grid must be a JSON object');
  }
  try {
    const parsed = JSON.parse(value) as unknown;
    if (parsed == null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new BadRequestException('grid must be a JSON object');
    }
    return parsed;
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw error;
    }
    throw new BadRequestException('grid must be a JSON object');
  }
}

function quickFilterWhere(
  query: GridQueryDto,
  options: GridListOptions,
): Record<string, unknown> | undefined {
  const fields = options.quickFilterFields ?? [];
  const terms = (query.filterModel?.quickFilterValues ?? [])
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean);
  if (terms.length === 0 || fields.length === 0) {
    return undefined;
  }
  for (const field of fields) {
    assertField(field, options.fields, 'filter');
    if (options.fields[field] !== 'string') {
      throw new BadRequestException(`Cannot search ${field}`);
    }
  }

  const groups = terms.map((term) => ({
    OR: fields.map((field) => ({
      [field]: { contains: term, mode: 'insensitive' },
    })),
  }));
  const logic = query.filterModel?.quickFilterLogicOperator === 'or' ? 'OR' : 'AND';
  return groups.length === 1 ? groups[0] : { [logic]: groups };
}

function filterClause(
  field: string,
  operator: string,
  value: unknown,
  options: GridListOptions,
): Record<string, unknown> | undefined {
  const type = options.fields[field];
  if (!type) {
    throw new BadRequestException(`Cannot filter by ${field}`);
  }
  if (operator === 'isEmpty') {
    return emptyClause(field, type);
  }
  if (operator === 'isNotEmpty') {
    return { NOT: emptyClause(field, type) };
  }
  if (!hasValue(value)) {
    return undefined;
  }
  if (type === 'enum') {
    return enumClause(field, operator, value, options.enumValues?.[field]);
  }
  if (type === 'boolean') {
    return booleanClause(field, operator, value);
  }
  if (operator === 'isAnyOf') {
    const list = (Array.isArray(value) ? value : [value]).map((item) => bind(type, item, field));
    const filter =
      type === 'string' ? { in: list, mode: 'insensitive' } : { in: list };
    return { [field]: filter };
  }

  const textKey = textOperators[operator];
  if (type === 'string' && textKey) {
    const filter = { [textKey]: bind('string', value, field), mode: 'insensitive' };
    return negatedOperators.has(operator)
      ? { NOT: { [field]: filter } }
      : { [field]: filter };
  }

  const comparison = comparisons[operator];
  if (comparison && type !== 'string') {
    const bound = bind(type, value, field);
    const filter = comparison === 'equals' ? bound : { [comparison]: bound };
    return negatedOperators.has(operator)
      ? { NOT: { [field]: filter } }
      : { [field]: filter };
  }

  throw new BadRequestException(`Cannot use ${operator} on ${field}`);
}

const equalityOperators = new Set(['is', 'equals', '=']);
const inequalityOperators = new Set(['not', 'doesNotEqual', '!=']);

function enumClause(
  field: string,
  operator: string,
  value: unknown,
  allowed: readonly string[] | undefined,
): Record<string, unknown> {
  if (!allowed) {
    throw new BadRequestException(`Cannot filter by ${field}`);
  }
  if (operator === 'isAnyOf') {
    const list = (Array.isArray(value) ? value : [value]).map((item) =>
      bindEnum(field, item, allowed),
    );
    return { [field]: { in: list } };
  }
  const bound = bindEnum(field, value, allowed);
  if (equalityOperators.has(operator)) {
    return { [field]: bound };
  }
  if (inequalityOperators.has(operator)) {
    return { NOT: { [field]: bound } };
  }
  throw new BadRequestException(`Cannot use ${operator} on ${field}`);
}

function booleanClause(
  field: string,
  operator: string,
  value: unknown,
): Record<string, unknown> {
  const bound = bindBoolean(field, value);
  if (equalityOperators.has(operator)) {
    return { [field]: bound };
  }
  if (inequalityOperators.has(operator)) {
    return { NOT: { [field]: bound } };
  }
  throw new BadRequestException(`Cannot use ${operator} on ${field}`);
}

function bindEnum(field: string, value: unknown, allowed: readonly string[]): string {
  if (typeof value !== 'string' || !allowed.includes(value)) {
    throw new BadRequestException(`${field} filter needs one of ${allowed.join(', ')}`);
  }
  return value;
}

function bindBoolean(field: string, value: unknown): boolean {
  if (value === true || value === 'true') {
    return true;
  }
  if (value === false || value === 'false') {
    return false;
  }
  throw new BadRequestException(`${field} filter needs true or false`);
}

function emptyClause(field: string, type: GridFieldType): Record<string, unknown> {
  if (type === 'string') {
    return { OR: [{ [field]: null }, { [field]: '' }] };
  }
  return { [field]: null };
}

function hasValue(value: unknown): boolean {
  if (value == null || value === '') {
    return false;
  }
  return !Array.isArray(value) || value.length > 0;
}

function bind(type: GridFieldType, value: unknown, field: string): string | number | Date {
  if (type === 'number' || type === 'decimal') {
    const number = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(number) || (type === 'number' && !Number.isInteger(number))) {
      throw new BadRequestException(
        type === 'number' ? `${field} filter needs a whole number` : `${field} filter needs a number`,
      );
    }
    return number;
  }
  if (type === 'date') {
    const date =
      value instanceof Date
        ? value
        : typeof value === 'string' && value.trim() !== ''
          ? new Date(value)
          : null;
    if (!date || Number.isNaN(date.getTime())) {
      throw new BadRequestException(`${field} filter needs a date`);
    }
    return date;
  }
  if (typeof value !== 'string' || value.length === 0 || value.length > 200) {
    throw new BadRequestException(`${field} filter needs a text value`);
  }
  return value;
}

function assertField(field: string, fields: GridFields, action: 'filter' | 'sort'): void {
  if (!fields[field]) {
    throw new BadRequestException(`Cannot ${action} by ${field}`);
  }
}

function validationMessages(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => [
    ...Object.values(error.constraints ?? {}),
    ...validationMessages(error.children ?? []),
  ]);
}
