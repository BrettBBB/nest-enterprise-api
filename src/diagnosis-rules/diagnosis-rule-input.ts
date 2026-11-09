import { Prisma } from '../../generated/prisma/client.js';
import type { CreateDiagnosisRuleDto } from './dto/create-diagnosis-rule.dto.js';
import type { UpdateDiagnosisRuleDto } from './dto/update-diagnosis-rule.dto.js';

function blankToNull(value: string | null | undefined): string | null | undefined {
  if (value == null) {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export function toDiagnosisRuleCreateInput(dto: CreateDiagnosisRuleDto): Prisma.DiagnosisRuleCreateInput {
  return {
    name: dto.name.trim(),
    description: dto.description.trim(),
    code: blankToNull(dto.code) ?? null,
    category: blankToNull(dto.category) ?? null,
    laterality: blankToNull(dto.laterality) ?? null,
    requireHccEligible: dto.requireHccEligible ?? false,
    enabled: dto.enabled ?? true,
  };
}

export function toDiagnosisRuleUpdateInput(dto: UpdateDiagnosisRuleDto): Prisma.DiagnosisRuleUpdateInput {
  return {
    name: dto.name?.trim(),
    description: dto.description?.trim(),
    code: dto.code === undefined ? undefined : blankToNull(dto.code),
    category: dto.category === undefined ? undefined : blankToNull(dto.category),
    laterality: dto.laterality === undefined ? undefined : blankToNull(dto.laterality),
    requireHccEligible: dto.requireHccEligible,
    enabled: dto.enabled,
  };
}
