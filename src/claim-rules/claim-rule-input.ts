import { Prisma } from '../../generated/prisma/client.js';
import type { CreateClaimRuleDto } from './dto/create-claim-rule.dto.js';
import type { UpdateClaimRuleDto } from './dto/update-claim-rule.dto.js';

function blankToNull(value: string | null | undefined): string | null | undefined {
  if (value == null) {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export function toClaimRuleCreateInput(dto: CreateClaimRuleDto): Prisma.ClaimRuleCreateInput {
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

export function toClaimRuleUpdateInput(dto: UpdateClaimRuleDto): Prisma.ClaimRuleUpdateInput {
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
