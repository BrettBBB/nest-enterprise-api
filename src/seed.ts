import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type ClaimOutcome, type MedicalCodeType } from '../generated/prisma/client.js';
import { mapDiagnosisSeed, mapProcedureSeed } from './code-import/map-seed.js';

type UserSeed = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  age: number | null;
  isAdmin: boolean;
};

type ClaimRuleSeed = {
  id: string;
  name: string;
  description: string;
  codeType: MedicalCodeType | null;
  code: string | null;
  category: string | null;
  minFeeCents: number;
  enabled: boolean;
};

type ProcedureRuleSeed = {
  id: string;
  name: string;
  description: string;
  codeType: string | null;
  code: string | null;
  category: string | null;
  minStandardCost: string;
  enabled: boolean;
};

type DiagnosisRuleSeed = {
  id: string;
  name: string;
  description: string;
  code: string | null;
  category: string | null;
  laterality: string | null;
  requireHccEligible: boolean;
  enabled: boolean;
};

type ClaimSeed = {
  id: string;
  claimNumber: string;
  codeType: MedicalCodeType;
  code: string;
  category: string;
  description: string;
  serviceDate: string;
  billedCents: number;
  outcome: ClaimOutcome;
  procedureFlag: ClaimOutcome;
  diagnosisFlag: ClaimOutcome;
};

type EnvironmentSeed = {
  users: UserSeed[];
  claimRules: ClaimRuleSeed[];
  procedureRules: ProcedureRuleSeed[];
  diagnosisRules: DiagnosisRuleSeed[];
};

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const snapshot = JSON.parse(await readFile(seedFile('environment-seed.json'), 'utf8')) as EnvironmentSeed;
  const claims = JSON.parse(await readFile(seedFile('claims-seed.json'), 'utf8')) as ClaimSeed[];

  await seedUsers(snapshot.users);
  await seedClaimRules(snapshot.claimRules);
  await seedProcedureRules(snapshot.procedureRules);
  await seedDiagnosisRules(snapshot.diagnosisRules);
  await seedProcedureCodes();
  await seedDiagnosisCodes();
  await seedClaims(claims);
}

function seedFile(name: string) {
  return path.join(process.cwd(), 'prisma', 'seeds', name);
}

async function seedUsers(users: UserSeed[]) {
  for (const user of users) {
    const data = {
      firstName: user.firstName,
      lastName: user.lastName,
      password: user.password,
      age: user.age,
      isAdmin: user.isAdmin,
    };
    await prisma.user.upsert({
      where: { email: user.email },
      update: data,
      create: { id: user.id, email: user.email, ...data },
    });
  }
  console.log(`Users: ${users.length}.`);
}

async function seedProcedureCodes() {
  const [cpt, hcpcs] = await Promise.all([
    readSeed('cpt_seed.json').then((rows) => mapProcedureSeed(rows, 'cpt_seed.json', 'CPT')),
    readSeed('hcpcs_seed.json').then((rows) => mapProcedureSeed(rows, 'hcpcs_seed.json', 'HCPCS')),
  ]);
  const data = [...cpt, ...hcpcs];
  await prisma.$transaction(
    async (tx) => {
      await tx.procedureCode.deleteMany();
      await tx.procedureCode.createMany({ data });
    },
    { timeout: 120_000 },
  );
  console.log(`Procedure codes: ${data.length}.`);
}

async function seedDiagnosisCodes() {
  const data = mapDiagnosisSeed(await readSeed('icd10_seed.json'), 'icd10_seed.json');
  await prisma.$transaction(
    async (tx) => {
      await tx.diagnosisCode.deleteMany();
      await tx.diagnosisCode.createMany({ data });
    },
    { timeout: 120_000 },
  );
  console.log(`Diagnosis codes: ${data.length}.`);
}

async function readSeed(file: string) {
  return JSON.parse(await readFile(seedFile(file), 'utf8')) as unknown;
}

async function seedClaimRules(rules: ClaimRuleSeed[]) {
  for (const rule of rules) {
    const data = {
      description: rule.description,
      codeType: rule.codeType,
      code: rule.code,
      category: rule.category,
      minFeeCents: rule.minFeeCents,
      enabled: rule.enabled,
    };
    await prisma.claimRule.upsert({
      where: { name: rule.name },
      update: data,
      create: { id: rule.id, name: rule.name, ...data },
    });
  }
  console.log(`Claim rules: ${rules.length}.`);
}

async function seedProcedureRules(rules: ProcedureRuleSeed[]) {
  for (const rule of rules) {
    const data = {
      description: rule.description,
      codeType: rule.codeType,
      code: rule.code,
      category: rule.category,
      minStandardCost: rule.minStandardCost,
      enabled: rule.enabled,
    };
    await prisma.procedureRule.upsert({
      where: { name: rule.name },
      update: data,
      create: { id: rule.id, name: rule.name, ...data },
    });
  }
  console.log(`Procedure rules: ${rules.length}.`);
}

async function seedDiagnosisRules(rules: DiagnosisRuleSeed[]) {
  for (const rule of rules) {
    const data = {
      description: rule.description,
      code: rule.code,
      category: rule.category,
      laterality: rule.laterality,
      requireHccEligible: rule.requireHccEligible,
      enabled: rule.enabled,
    };
    await prisma.diagnosisRule.upsert({
      where: { name: rule.name },
      update: data,
      create: { id: rule.id, name: rule.name, ...data },
    });
  }
  console.log(`Diagnosis rules: ${rules.length}.`);
}

async function seedClaims(claims: ClaimSeed[]) {
  for (const claim of claims) {
    const data = {
      codeType: claim.codeType,
      code: claim.code,
      category: claim.category,
      description: claim.description,
      serviceDate: new Date(claim.serviceDate),
      billedCents: claim.billedCents,
      outcome: claim.outcome,
      procedureFlag: claim.procedureFlag,
      diagnosisFlag: claim.diagnosisFlag,
    };
    await prisma.claim.upsert({
      where: { claimNumber: claim.claimNumber },
      update: data,
      create: { id: claim.id, claimNumber: claim.claimNumber, ...data },
    });
  }
  console.log(`Claims: ${claims.length}.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
