import { readFile } from 'node:fs/promises';
import path from 'node:path';

type EnvironmentSeed = {
  users: Array<{ email: string; isAdmin: boolean; password: string }>;
  claimRules: unknown[];
  procedureRules: unknown[];
  diagnosisRules: unknown[];
};

type ClaimSeed = {
  claimNumber: string;
  code: string;
  codeType: string;
  procedureFlag: string;
};

function seedFile(name: string) {
  return path.join(process.cwd(), 'prisma', 'seeds', name);
}

describe('environment seed', () => {
  let snapshot: EnvironmentSeed;
  let claims: ClaimSeed[];

  beforeAll(async () => {
    snapshot = JSON.parse(await readFile(seedFile('environment-seed.json'), 'utf8')) as EnvironmentSeed;
    claims = JSON.parse(await readFile(seedFile('claims-seed.json'), 'utf8')) as ClaimSeed[];
  });

  it('keeps the admin and non-admin accounts', () => {
    expect(snapshot.users.map((user) => [user.email, user.isAdmin])).toEqual([
      ['brett.brinkhoff@outlook.com', true],
      ['poppa@smurf.com', false],
    ]);
    expect(snapshot.users.every((user) => user.password.startsWith('scrypt$'))).toBe(true);
  });

  it('keeps the current rules and a separate claims file', () => {
    expect(snapshot).not.toHaveProperty('medicalCodes');
    expect(snapshot.claimRules).toHaveLength(5);
    expect(snapshot.procedureRules).toHaveLength(3);
    expect(snapshot.diagnosisRules).toHaveLength(3);
    expect(claims).toHaveLength(276);
    expect(claims.every((claim) => claim.claimNumber && claim.code && claim.codeType)).toBe(true);
    expect(
      claims
        .filter((claim) => claim.claimNumber >= 'CLM-100261' && claim.claimNumber <= 'CLM-100268')
        .every((claim) => claim.procedureFlag === 'PASSED'),
    ).toBe(true);
    expect(claims.filter((claim) => claim.procedureFlag === 'TRIGGERED')).toHaveLength(8);
  });
});
