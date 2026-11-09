import { Prisma } from '../../generated/prisma/client.js';
import type { CreateProcedureRuleDto } from './dto/create-procedure-rule.dto.js';
import type { UpdateProcedureRuleDto } from './dto/update-procedure-rule.dto.js';

function blankToNull(value: string | null | undefined): string | null | undefined {
  if (value == null) {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function money(value: number) {
  return Math.round(value * 100) / 100;
}

export function toProcedureRuleCreateInput(dto: CreateProcedureRuleDto): Prisma.ProcedureRuleCreateInput {
  return {
    name: dto.name.trim(),
    description: dto.description.trim(),
    codeType: dto.codeType ?? null,
    code: blankToNull(dto.code) ?? null,
    category: blankToNull(dto.category) ?? null,
    minStandardCost: money(dto.minStandardCost),
    enabled: dto.enabled ?? true,
  };
}

export function toProcedureRuleUpdateInput(dto: UpdateProcedureRuleDto): Prisma.ProcedureRuleUpdateInput {
  return {
    name: dto.name?.trim(),
    description: dto.description?.trim(),
    codeType: dto.codeType,
    code: dto.code === undefined ? undefined : blankToNull(dto.code),
    category: dto.category === undefined ? undefined : blankToNull(dto.category),
    minStandardCost: dto.minStandardCost === undefined ? undefined : money(dto.minStandardCost),
    enabled: dto.enabled,
  };
}
