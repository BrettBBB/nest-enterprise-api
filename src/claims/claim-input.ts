import type { MedicalCodeTypeName } from '../common/code-types.js';
import type { CreateClaimDto } from './dto/create-claim.dto.js';
import type { UpdateClaimDto } from './dto/update-claim.dto.js';

export type ClaimWrite = {
  claimNumber?: string;
  codeType?: MedicalCodeTypeName;
  code?: string;
  serviceDate?: Date;
  billedCents?: number;
};

function serviceDate(value: string) {
  return new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
}

export function toClaimCreateInput(dto: CreateClaimDto): Required<ClaimWrite> {
  return {
    claimNumber: dto.claimNumber.trim().toUpperCase(),
    codeType: dto.codeType,
    code: dto.code.trim().toUpperCase(),
    serviceDate: serviceDate(dto.serviceDate),
    billedCents: dto.billedCents,
  };
}

export function toClaimUpdateInput(dto: UpdateClaimDto): ClaimWrite {
  return {
    claimNumber: dto.claimNumber === undefined ? undefined : dto.claimNumber.trim().toUpperCase(),
    codeType: dto.codeType,
    code: dto.code === undefined ? undefined : dto.code.trim().toUpperCase(),
    serviceDate: dto.serviceDate === undefined ? undefined : serviceDate(dto.serviceDate),
    billedCents: dto.billedCents,
  };
}
