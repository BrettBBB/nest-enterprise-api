import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type DiagnosisRule } from '../../generated/prisma/client.js';
import { refreshCodeFlags } from '../code-rules/refresh-code-flags.js';
import { rethrowUnlessMissing } from '../common/functions.js';
import type { GridListArgs } from '../common/grid-query.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DiagnosisRulesService {
  constructor(private readonly prisma: PrismaService) {}

  async createDiagnosisRule(data: Prisma.DiagnosisRuleCreateInput) {
    try {
      const rule = await this.prisma.diagnosisRule.create({ data });
      await refreshCodeFlags(this.prisma);
      return rule;
    } catch (error) {
      rethrowDuplicate(error);
    }
  }

  async findDiagnosisRules(args: GridListArgs) {
    const where = args.where as Prisma.DiagnosisRuleWhereInput;
    const [rows, rowCount] = await Promise.all([
      this.prisma.diagnosisRule.findMany({
        where,
        ...(args.orderBy ? { orderBy: args.orderBy as Prisma.DiagnosisRuleOrderByWithRelationInput[] } : {}),
        ...(args.skip != null ? { skip: args.skip } : {}),
        ...(args.take != null ? { take: args.take } : {}),
      }),
      this.prisma.diagnosisRule.count({ where }),
    ]);
    return { rows, rowCount };
  }

  async findDiagnosisRuleById(id: DiagnosisRule['id']) {
    const rule = await this.prisma.diagnosisRule.findUnique({ where: { id } });
    if (!rule) {
      throw new NotFoundException('Diagnosis rule not found');
    }
    return rule;
  }

  async updateDiagnosisRule(id: DiagnosisRule['id'], data: Prisma.DiagnosisRuleUpdateInput) {
    try {
      const rule = await this.prisma.diagnosisRule.update({ where: { id }, data });
      await refreshCodeFlags(this.prisma);
      return rule;
    } catch (error) {
      rethrowDuplicate(error);
    }
  }

  async deleteDiagnosisRule(id: DiagnosisRule['id']) {
    try {
      const rule = await this.prisma.diagnosisRule.delete({ where: { id } });
      await refreshCodeFlags(this.prisma);
      return rule;
    } catch (error) {
      rethrowUnlessMissing(error, 'Diagnosis rule not found');
    }
  }
}

function rethrowDuplicate(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    throw new ConflictException('That diagnosis rule name already exists');
  }
  rethrowUnlessMissing(error, 'Diagnosis rule not found');
}
