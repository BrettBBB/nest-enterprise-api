import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type Claim } from '../../generated/prisma/client.js';
import type { GridListArgs } from '../common/grid-query.js';
import { rethrowUnlessMissing } from '../common/functions.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { flagsForClaim } from '../code-rules/refresh-code-flags.js';
import { claimOutcome } from '../rules/claim-outcomes.js';
import type { ClaimWrite } from './claim-input.js';

@Injectable()
export class ClaimsService {
  constructor(private readonly prisma: PrismaService) {}

  async createClaim(input: Required<ClaimWrite>) {
    const data = await this.toCreateData(input);
    try {
      return await this.prisma.claim.create({ data });
    } catch (error) {
      rethrowDuplicate(error);
    }
  }

  async findClaims(args: GridListArgs) {
    const where = args.where as Prisma.ClaimWhereInput;
    const [rows, rowCount] = await Promise.all([
      this.prisma.claim.findMany({
        where,
        ...(args.orderBy ? { orderBy: args.orderBy as Prisma.ClaimOrderByWithRelationInput[] } : {}),
        ...(args.skip != null ? { skip: args.skip } : {}),
        ...(args.take != null ? { take: args.take } : {}),
      }),
      this.prisma.claim.count({ where }),
    ]);
    return { rows, rowCount };
  }

  async findClaimById(id: Claim['id']) {
    const claim = await this.prisma.claim.findUnique({ where: { id } });
    if (!claim) {
      throw new NotFoundException('Claim not found');
    }
    return claim;
  }

  async updateClaim(id: Claim['id'], input: ClaimWrite) {
    const current = await this.findClaimById(id);
    const data = await this.toUpdateData(current, input);
    try {
      return await this.prisma.claim.update({ where: { id }, data });
    } catch (error) {
      rethrowDuplicate(error);
    }
  }

  async deleteClaim(id: Claim['id']) {
    try {
      return await this.prisma.claim.delete({ where: { id } });
    } catch (error) {
      rethrowUnlessMissing(error, 'Claim not found');
    }
  }

  private async toCreateData(input: Required<ClaimWrite>): Promise<Prisma.ClaimCreateInput> {
    const referenced = await this.findReferencedCode(input.codeType, input.code);
    const scored = {
      codeType: referenced.codeType,
      code: referenced.code,
      category: referenced.category,
      billedCents: input.billedCents,
    };
    const [outcome, flags] = await Promise.all([this.outcomeFor(scored), flagsForClaim(this.prisma, scored)]);
    return {
      claimNumber: input.claimNumber,
      codeType: referenced.codeType,
      code: referenced.code,
      category: referenced.category,
      description: referenced.description,
      serviceDate: input.serviceDate,
      billedCents: input.billedCents,
      outcome,
      ...flags,
    };
  }

  private async toUpdateData(current: Claim, input: ClaimWrite): Promise<Prisma.ClaimUpdateInput> {
    const codeType = input.codeType ?? current.codeType;
    const code = input.code ?? current.code;
    const billedCents = input.billedCents ?? current.billedCents;
    const codeChanged = codeType !== current.codeType || code !== current.code;
    const referenced = codeChanged ? await this.findReferencedCode(codeType, code) : null;
    const scored = {
      codeType: referenced?.codeType ?? current.codeType,
      code: referenced?.code ?? current.code,
      category: referenced?.category ?? current.category,
      billedCents,
    };
    const [outcome, flags] = await Promise.all([this.outcomeFor(scored), flagsForClaim(this.prisma, scored)]);
    return {
      claimNumber: input.claimNumber,
      ...(referenced
        ? {
            codeType: referenced.codeType,
            code: referenced.code,
            category: referenced.category,
            description: referenced.description,
          }
        : {}),
      serviceDate: input.serviceDate,
      billedCents: input.billedCents,
      outcome,
      ...flags,
    };
  }

  private async findReferencedCode(codeType: Claim['codeType'], code: string) {
    if (codeType === 'ICD10') {
      const diagnosis = await this.prisma.diagnosisCode.findUnique({ where: { code } });
      if (!diagnosis) {
        throw new BadRequestException('That diagnosis code is not in the catalog');
      }
      return {
        codeType,
        code: diagnosis.code,
        category: diagnosis.category ?? '',
        description: diagnosis.shortDescription,
      };
    }

    const procedure = await this.prisma.procedureCode.findUnique({ where: { code } });
    if (!procedure || procedure.codeType !== codeType) {
      throw new BadRequestException('That procedure code is not in the catalog');
    }
    return {
      codeType,
      code: procedure.code,
      category: procedure.category ?? '',
      description: procedure.shortDescription,
    };
  }

  private async outcomeFor(claim: {
    codeType: string;
    code: string;
    category: string;
    billedCents: number;
  }) {
    const rules = await this.prisma.ruleDefinition.findMany();
    return claimOutcome(claim, rules);
  }
}

function rethrowDuplicate(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    throw new ConflictException('That claim number already exists');
  }
  rethrowUnlessMissing(error, 'Claim not found');
}
