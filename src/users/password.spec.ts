import { hashPassword, verifyPassword } from './password.js';

describe('password hashing', () => {
  it('stores a salted scrypt hash instead of the password', async () => {
    const password = 'ChangeMe123';
    const first = await hashPassword(password);
    const second = await hashPassword(password);

    expect(first).not.toBe(password);
    expect(first.startsWith('scrypt$')).toBe(true);
    expect(first.split('$')[2]).toHaveLength(128);
    expect(first).not.toBe(second);
  });

  it('accepts the original password and rejects anything else', async () => {
    const stored = await hashPassword('ChangeMe123');

    await expect(verifyPassword('ChangeMe123', stored)).resolves.toBe(true);
    await expect(verifyPassword('ChangeMe124', stored)).resolves.toBe(false);
    await expect(verifyPassword('ChangeMe123', 'not-a-hash')).resolves.toBe(
      false,
    );
  });
});
