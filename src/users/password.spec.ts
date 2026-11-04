import { hashPassword } from './password.js';

describe('hashPassword', () => {
  it('stores a salted scrypt hash instead of the password', async () => {
    const password = 'ChangeMe123';
    const first = await hashPassword(password);
    const second = await hashPassword(password);

    expect(first).not.toBe(password);
    expect(first.startsWith('scrypt$')).toBe(true);
    expect(first.split('$')[2]).toHaveLength(128);
    expect(first).not.toBe(second);
  });
});
