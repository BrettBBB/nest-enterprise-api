import { validateEnv } from './env.validation.js';

const validEnv = {
  DATABASE_URL: 'postgres://localhost/app',
  JWT_SECRET: 'secret',
  ACCESS_TOKEN_TTL_SECONDS: '900',
  REFRESH_TOKEN_TTL_SECONDS: '604800',
};

describe('environment validation', () => {
  it('parses required values and coerces token lifetimes to numbers', () => {
    expect(validateEnv(validEnv)).toMatchObject({
      DATABASE_URL: 'postgres://localhost/app',
      JWT_SECRET: 'secret',
      ACCESS_TOKEN_TTL_SECONDS: 900,
      REFRESH_TOKEN_TTL_SECONDS: 604800,
    });
  });

  it('treats a blank optional value as unset', () => {
    expect(validateEnv({ ...validEnv, RESEND_FROM: '  ', PORT: '' }).PORT).toBeUndefined();
    expect(validateEnv({ ...validEnv, RESEND_FROM: '  ', PORT: '' }).RESEND_FROM).toBeUndefined();
  });

  it('rejects a missing secret and a non-integer lifetime', () => {
    expect(() => validateEnv({ ...validEnv, JWT_SECRET: '' })).toThrow(/JWT_SECRET/);
    expect(() => validateEnv({ ...validEnv, ACCESS_TOKEN_TTL_SECONDS: '15m' })).toThrow(
      /ACCESS_TOKEN_TTL_SECONDS/,
    );
  });
});
