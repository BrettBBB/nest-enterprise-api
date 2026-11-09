import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import type { GridListArgs } from '../common/grid-query.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DiagnosisCodesService {
  constructor(private readonly prisma: PrismaService) {}

  async findDiagnosisCodes(args: GridListArgs) {
    const where = args.where as Prisma.DiagnosisCodeWhereInput;
    const [rows, rowCount] = await Promise.all([
      this.prisma.diagnosisCode.findMany({
        where,
        ...(args.orderBy ? { orderBy: args.orderBy as Prisma.DiagnosisCodeOrderByWithRelationInput[] } : {}),
        ...(args.skip != null ? { skip: args.skip } : {}),
        ...(args.take != null ? { take: args.take } : {}),
      }),
      this.prisma.diagnosisCode.count({ where }),
    ]);
    return { rows, rowCount };
  }

  async findDiagnosisCategories() {
    const rows = await this.prisma.diagnosisCode.findMany({
      where: { category: { not: '' } },
      distinct: ['category'],
      select: { category: true },
      orderBy: { category: 'asc' },
    });
    return rows.flatMap((row) => (row.category ? [row.category] : []));
  }

  async findDiagnosisCode(code: string) {
    const row = await this.prisma.diagnosisCode.findUnique({ where: { code } });
    if (!row) {
      throw new NotFoundException('Diagnosis code not found');
    }
    return row;
  }
}
