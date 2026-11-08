import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SendEmailDto } from './send-email.dto.js';
import { sendEmailExample } from './email.examples.js';

describe('SendEmailDto', () => {
  it('accepts the sample message and trims the fields', async () => {
    const dto = plainToInstance(SendEmailDto, {
      name: '  Ada Lovelace  ',
      email: '  ada@example.com  ',
      message: '  Hello  ',
    });

    expect(await validate(dto)).toEqual([]);
    expect(dto.name).toBe('Ada Lovelace');
    expect(dto.email).toBe('ada@example.com');
    expect(dto.message).toBe('Hello');
  });

  it('rejects a missing message and an invalid email', async () => {
    const errors = await validate(
      plainToInstance(SendEmailDto, {
        ...sendEmailExample,
        email: 'not-an-email',
        message: '   ',
      }),
    );
    const fields = errors.map((error) => error.property);

    expect(fields).toContain('email');
    expect(fields).toContain('message');
  });
});
