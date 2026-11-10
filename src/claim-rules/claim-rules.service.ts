import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type ClaimRule } from '../../generated/prisma/client.js';
import type { GridListArgs } from '../common/grid-query.js';
import { rethrowUnlessMissing } from '../common/functions.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { refreshClaimOutcomes } from './claim-outcomes.js';

@Injectable()
export class ClaimRulesService {
  constructor(private readonly prisma: PrismaService) {}

  async createClaimRule(data: Prisma.ClaimRuleCreateInput) {
    try {
      const rule = await this.prisma.claimRule.create({ data });
      await refreshClaimOutcomes(this.prisma);
      return rule;
    } catch (error) {
      rethrowDuplicate(error);
    }
  }

  async findClaimRules(args: GridListArgs) {
    const where = args.where as Prisma.ClaimRuleWhereInput;
    const [rows, rowCount] = await Promise.all([
      this.prisma.claimRule.findMany({
        where,
        ...(args.orderBy
          ? { orderBy: args.orderBy as Prisma.ClaimRuleOrderByWithRelationInput[] }
          : {}),
        ...(args.skip != null ? { skip: args.skip } : {}),
        ...(args.take != null ? { take: args.take } : {}),
      }),
      this.prisma.claimRule.count({ where }),
    ]);
    return { rows, rowCount };
  }

  async findClaimRuleById(id: ClaimRule['id']) {
    const rule = await this.prisma.claimRule.findUnique({ where: { id } });
    if (!rule) {
      throw new NotFoundException('Claim rule not found');
    }
    return rule;
  }

  async updateClaimRule(id: ClaimRule['id'], data: Prisma.ClaimRuleUpdateInput) {
    try {
      const rule = await this.prisma.claimRule.update({ where: { id }, data });
      await refreshClaimOutcomes(this.prisma);
      return rule;
    } catch (error) {
      rethrowDuplicate(error);
    }
  }

  async deleteClaimRule(id: ClaimRule['id']) {
    try {
      const rule = await this.prisma.claimRule.delete({ where: { id } });
      await refreshClaimOutcomes(this.prisma);
      return rule;
    } catch (error) {
      rethrowUnlessMissing(error, 'Claim rule not found');
    }
  }
}

function rethrowDuplicate(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    throw new ConflictException('That claim rule name already exists');
  }
  rethrowUnlessMissing(error, 'Claim rule not found');
}
