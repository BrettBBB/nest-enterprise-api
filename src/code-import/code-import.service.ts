import { Injectable } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { refreshCodeFlags } from '../code-rules/refresh-code-flags.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { mapDiagnosisSeed, mapProcedureSeed } from './map-seed.js';

const cptSeed = 'cpt_seed.json';
const hcpcsSeed = 'hcpcs_seed.json';
const icd10Seed = 'icd10_seed.json';

@Injectable()
export class CodeImportService {
  constructor(private readonly prisma: PrismaService) {}

  async importProcedures() {
    const [cpt, hcpcs] = await Promise.all([
      readSeed(cptSeed).then((rows) => mapProcedureSeed(rows, cptSeed, 'CPT')),
      readSeed(hcpcsSeed).then((rows) => mapProcedureSeed(rows, hcpcsSeed, 'HCPCS')),
    ]);
    const data = [...cpt, ...hcpcs];
    await this.prisma.$transaction(
      async (tx) => {
        await tx.procedureCode.deleteMany();
        await tx.procedureCode.createMany({ data });
      },
      { timeout: 120_000 },
    );
    await refreshCodeFlags(this.prisma);
    return { imported: data.length };
  }

  async importDiagnoses() {
    const data = mapDiagnosisSeed(await readSeed(icd10Seed), icd10Seed);
    await this.prisma.$transaction(
      async (tx) => {
        await tx.diagnosisCode.deleteMany();
        await tx.diagnosisCode.createMany({ data });
      },
      { timeout: 120_000 },
    );
    await refreshCodeFlags(this.prisma);
    return { imported: data.length };
  }
}

async function readSeed(file: string) {
  const text = await readFile(path.join(process.cwd(), 'prisma', 'seeds', file), 'utf8');
  return JSON.parse(text) as unknown;
}
