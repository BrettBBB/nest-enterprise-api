import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type ProcedureCode } from '../../generated/prisma/client.js';
import { decimalToNumber } from '../common/decimals.js';
import type { GridListArgs } from '../common/grid-query.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProcedureCodesService {
  constructor(private readonly prisma: PrismaService) {}

  async findProcedureCodes(args: GridListArgs) {
    const where = args.where as Prisma.ProcedureCodeWhereInput;
    const [rows, rowCount] = await Promise.all([
      this.prisma.procedureCode.findMany({
        where,
        ...(args.orderBy ? { orderBy: args.orderBy as Prisma.ProcedureCodeOrderByWithRelationInput[] } : {}),
        ...(args.skip != null ? { skip: args.skip } : {}),
        ...(args.take != null ? { take: args.take } : {}),
      }),
      this.prisma.procedureCode.count({ where }),
    ]);
    return { rows: rows.map(toProcedureCodeView), rowCount };
  }

  async findProcedureCategories() {
    const rows = await this.prisma.procedureCode.findMany({
      where: { category: { not: '' } },
      distinct: ['category'],
      select: { category: true },
      orderBy: { category: 'asc' },
    });
    return rows.flatMap((row) => (row.category ? [row.category] : []));
  }

  async findProcedureCode(code: string) {
    const row = await this.prisma.procedureCode.findUnique({ where: { code } });
    if (!row) {
      throw new NotFoundException('Procedure code not found');
    }
    return toProcedureCodeView(row);
  }
}

function toProcedureCodeView(row: ProcedureCode) {
  return {
    ...row,
    workRvu: decimalToNumber(row.workRvu),
    peRvu: decimalToNumber(row.peRvu),
    mpRvu: decimalToNumber(row.mpRvu),
    totalRvu: decimalToNumber(row.totalRvu),
    standardCost: decimalToNumber(row.standardCost),
  };
}
