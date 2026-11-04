import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { loginExample } from './auth.examples.js';
import { LoginDto } from './login.dto.js';

describe('LoginDto', () => {
  it('accepts the sample login and trims the email', async () => {
    const dto = plainToInstance(LoginDto, {
      ...loginExample,
      email: '  ada@example.com  ',
    });

    expect(await validate(dto)).toEqual([]);
    expect(dto.email).toBe('ada@example.com');
    expect(dto.password).toBe(loginExample.password);
  });

  it('rejects a missing email and a short password', async () => {
    const errors = await validate(
      plainToInstance(LoginDto, { password: 'short' }),
    );
    const fields = errors.map((error) => error.property);

    expect(fields).toEqual(expect.arrayContaining(['email', 'password']));
  });
});
