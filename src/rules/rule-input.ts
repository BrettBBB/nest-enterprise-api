import { Prisma } from '../../generated/prisma/client.js';
import type { CreateRuleDto } from './dto/create-rule.dto.js';
import type { UpdateRuleDto } from './dto/update-rule.dto.js';

function blankToNull(value: string | null | undefined): string | null | undefined {
  if (value == null) {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export function toRuleCreateInput(dto: CreateRuleDto): Prisma.RuleDefinitionCreateInput {
  return {
    name: dto.name.trim(),
    description: dto.description.trim(),
    codeType: dto.codeType ?? null,
    code: blankToNull(dto.code) ?? null,
    category: blankToNull(dto.category) ?? null,
    minFeeCents: dto.minFeeCents,
    enabled: dto.enabled ?? true,
  };
}

export function toRuleUpdateInput(dto: UpdateRuleDto): Prisma.RuleDefinitionUpdateInput {
  return {
    name: dto.name?.trim(),
    description: dto.description?.trim(),
    codeType: dto.codeType,
    code: dto.code === undefined ? undefined : blankToNull(dto.code),
    category: dto.category === undefined ? undefined : blankToNull(dto.category),
    minFeeCents: dto.minFeeCents,
    enabled: dto.enabled,
  };
}
