import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type ProcedureRule } from '../../generated/prisma/client.js';
import { refreshCodeFlags } from '../code-rules/refresh-code-flags.js';
import { decimalToNumber } from '../common/decimals.js';
import { rethrowUnlessMissing } from '../common/functions.js';
import type { GridListArgs } from '../common/grid-query.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProcedureRulesService {
  constructor(private readonly prisma: PrismaService) {}

  async createProcedureRule(data: Prisma.ProcedureRuleCreateInput) {
    try {
      const rule = await this.prisma.procedureRule.create({ data });
      await refreshCodeFlags(this.prisma);
      return toProcedureRuleView(rule);
    } catch (error) {
      rethrowDuplicate(error);
    }
  }

  async findProcedureRules(args: GridListArgs) {
    const where = args.where as Prisma.ProcedureRuleWhereInput;
    const [rows, rowCount] = await Promise.all([
      this.prisma.procedureRule.findMany({
        where,
        ...(args.orderBy ? { orderBy: args.orderBy as Prisma.ProcedureRuleOrderByWithRelationInput[] } : {}),
        ...(args.skip != null ? { skip: args.skip } : {}),
        ...(args.take != null ? { take: args.take } : {}),
      }),
      this.prisma.procedureRule.count({ where }),
    ]);
    return { rows: rows.map(toProcedureRuleView), rowCount };
  }

  async findProcedureRuleById(id: ProcedureRule['id']) {
    const rule = await this.prisma.procedureRule.findUnique({ where: { id } });
    if (!rule) {
      throw new NotFoundException('Procedure rule not found');
    }
    return toProcedureRuleView(rule);
  }

  async updateProcedureRule(id: ProcedureRule['id'], data: Prisma.ProcedureRuleUpdateInput) {
    try {
      const rule = await this.prisma.procedureRule.update({ where: { id }, data });
      await refreshCodeFlags(this.prisma);
      return toProcedureRuleView(rule);
    } catch (error) {
      rethrowDuplicate(error);
    }
  }

  async deleteProcedureRule(id: ProcedureRule['id']) {
    try {
      const rule = await this.prisma.procedureRule.delete({ where: { id } });
      await refreshCodeFlags(this.prisma);
      return toProcedureRuleView(rule);
    } catch (error) {
      rethrowUnlessMissing(error, 'Procedure rule not found');
    }
  }
}

function toProcedureRuleView(row: ProcedureRule) {
  return {
    ...row,
    minStandardCost: decimalToNumber(row.minStandardCost) ?? 0,
  };
}

function rethrowDuplicate(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    throw new ConflictException('That procedure rule name already exists');
  }
  rethrowUnlessMissing(error, 'Procedure rule not found');
}
