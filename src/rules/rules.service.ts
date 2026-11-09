import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type RuleDefinition } from '../../generated/prisma/client.js';
import type { GridListArgs } from '../common/grid-query.js';
import { rethrowUnlessMissing } from '../common/functions.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { refreshClaimOutcomes } from './claim-outcomes.js';

@Injectable()
export class RulesService {
  constructor(private readonly prisma: PrismaService) {}

  async createRule(data: Prisma.RuleDefinitionCreateInput) {
    try {
      const rule = await this.prisma.ruleDefinition.create({ data });
      await refreshClaimOutcomes(this.prisma);
      return rule;
    } catch (error) {
      rethrowDuplicate(error);
    }
  }

  async findRules(args: GridListArgs) {
    const where = args.where as Prisma.RuleDefinitionWhereInput;
    const [rows, rowCount] = await Promise.all([
      this.prisma.ruleDefinition.findMany({
        where,
        ...(args.orderBy
          ? { orderBy: args.orderBy as Prisma.RuleDefinitionOrderByWithRelationInput[] }
          : {}),
        ...(args.skip != null ? { skip: args.skip } : {}),
        ...(args.take != null ? { take: args.take } : {}),
      }),
      this.prisma.ruleDefinition.count({ where }),
    ]);
    return { rows, rowCount };
  }

  async findRuleById(id: RuleDefinition['id']) {
    const rule = await this.prisma.ruleDefinition.findUnique({ where: { id } });
    if (!rule) {
      throw new NotFoundException('Rule not found');
    }
    return rule;
  }

  async updateRule(id: RuleDefinition['id'], data: Prisma.RuleDefinitionUpdateInput) {
    try {
      const rule = await this.prisma.ruleDefinition.update({ where: { id }, data });
      await refreshClaimOutcomes(this.prisma);
      return rule;
    } catch (error) {
      rethrowDuplicate(error);
    }
  }

  async deleteRule(id: RuleDefinition['id']) {
    try {
      const rule = await this.prisma.ruleDefinition.delete({ where: { id } });
      await refreshClaimOutcomes(this.prisma);
      return rule;
    } catch (error) {
      rethrowUnlessMissing(error, 'Rule not found');
    }
  }
}

function rethrowDuplicate(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    throw new ConflictException('That rule name already exists');
  }
  rethrowUnlessMissing(error, 'Rule not found');
}
