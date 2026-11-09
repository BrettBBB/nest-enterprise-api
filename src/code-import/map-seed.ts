import { BadRequestException } from '@nestjs/common';

export type ProcedureImportRow = {
  code: string;
  codeType: 'CPT' | 'HCPCS';
  category: string | null;
  shortDescription: string;
  longDescription: string;
  workRvu: number | null;
  peRvu: number | null;
  mpRvu: number | null;
  totalRvu: number | null;
  standardCost: number | null;
  effectiveDate: Date;
};

export type DiagnosisImportRow = {
  code: string;
  codeType: 'ICD-10-CM';
  category: string | null;
  shortDescription: string;
  longDescription: string;
  isBillable: boolean;
  requires7thCharacter: boolean;
  laterality: string | null;
  episodeOfCare: boolean;
  isHccEligible: boolean;
  effectiveDate: Date;
};

type JsonRecord = Record<string, unknown>;

const diagnosisEffectiveDate = new Date('2026-01-01T00:00:00.000Z');

export function mapProcedureSeed(value: unknown, file: string, codeType: 'CPT' | 'HCPCS'): ProcedureImportRow[] {
  const byCode = new Map<string, ProcedureImportRow>();
  for (const row of asRows(value, file)) {
    const code = text(row, 'code', file, 10);
    if (row.type !== codeType) {
      throw new BadRequestException(`${file} ${code} is not a ${codeType} code`);
    }
    byCode.set(code, {
      code,
      codeType,
      category: optionalText(row, 'category', file, 100),
      shortDescription: text(row, 'short_description', file, 10_000),
      longDescription: text(row, 'description', file, 20_000),
      workRvu: decimal(row, 'work_rvu', file),
      peRvu: decimal(row, 'pe_rvu', file),
      mpRvu: decimal(row, 'mp_rvu', file),
      totalRvu: decimal(row, 'total_rvu', file),
      standardCost: decimal(row, 'standard_cost', file),
      effectiveDate: day(row, 'effective_date', file),
    });
  }
  return [...byCode.values()];
}

export function mapDiagnosisSeed(value: unknown, file: string): DiagnosisImportRow[] {
  const byCode = new Map<string, DiagnosisImportRow>();
  for (const row of asRows(value, file)) {
    const code = text(row, 'code', file, 10);
    byCode.set(code, {
      code,
      codeType: 'ICD-10-CM',
      category: optionalText(row, 'category', file, 100),
      shortDescription: text(row, 'short_description', file, 10_000),
      longDescription: text(row, 'description', file, 20_000),
      isBillable: flag(row, 'is_billable', file),
      requires7thCharacter: flag(row, 'requires_7th_character', file),
      laterality: optionalText(row, 'laterality', file, 20),
      episodeOfCare: flag(row, 'episode_of_care', file),
      isHccEligible: flag(row, 'hcc_eligible', file),
      effectiveDate: row.effective_date == null ? diagnosisEffectiveDate : day(row, 'effective_date', file),
    });
  }
  return [...byCode.values()];
}

function asRows(value: unknown, file: string): JsonRecord[] {
  if (!Array.isArray(value)) {
    throw new BadRequestException(`${file} must be a list of codes`);
  }
  return value.map((row) => {
    if (typeof row !== 'object' || row === null || Array.isArray(row)) {
      throw new BadRequestException(`${file} contains a row that is not an object`);
    }
    return row as JsonRecord;
  });
}

function text(row: JsonRecord, field: string, file: string, max: number): string {
  const value = optionalText(row, field, file, max);
  if (!value) {
    throw new BadRequestException(`${file} ${label(row)} is missing ${field}`);
  }
  return value;
}

function optionalText(row: JsonRecord, field: string, file: string, max: number): string | null {
  const value = row[field];
  if (value == null || value === '') {
    return null;
  }
  if (typeof value !== 'string' || value.trim() === '' || value.length > max) {
    throw new BadRequestException(`${file} ${label(row)} ${field} is not valid text`);
  }
  return value.trim();
}

function decimal(row: JsonRecord, field: string, file: string): number | null {
  const value = row[field];
  if (value == null || value === '') {
    return null;
  }
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) {
    throw new BadRequestException(`${file} ${label(row)} ${field} is not a number`);
  }
  return Math.round(number * 100) / 100;
}

function flag(row: JsonRecord, field: string, file: string): boolean {
  const value = row[field];
  if (typeof value !== 'boolean') {
    throw new BadRequestException(`${file} ${label(row)} ${field} must be true or false`);
  }
  return value;
}

function day(row: JsonRecord, field: string, file: string): Date {
  const value = text(row, field, file, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new BadRequestException(`${file} ${label(row)} ${field} must be a date`);
  }
  return new Date(`${value}T00:00:00.000Z`);
}

function label(row: JsonRecord) {
  return typeof row.code === 'string' && row.code.length > 0 ? row.code : 'row';
}
