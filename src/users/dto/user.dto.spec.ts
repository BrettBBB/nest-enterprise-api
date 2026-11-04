import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto.js';
import { UpdateUserDto } from './update-user.dto.js';
import { UserIdParamDto } from './user-id-param.dto.js';
import { createUserExample, userIdExample } from './user.examples.js';

async function validationErrors<T extends object>(
  cls: new () => T,
  plain: object,
) {
  return validate(plainToInstance(cls, plain));
}

describe('CreateUserDto', () => {
  it('accepts the sample user and trims names', async () => {
    const dto = plainToInstance(CreateUserDto, {
      ...createUserExample,
      firstName: '  Ada  ',
      lastName: ' Lovelace ',
      age: '36',
    });

    expect(await validate(dto)).toEqual([]);
    expect(dto.firstName).toBe('Ada');
    expect(dto.lastName).toBe('Lovelace');
    expect(dto.age).toBe(36);
  });

  it('rejects a missing email, a short password, and an age outside 0-120', async () => {
    const errors = await validationErrors(CreateUserDto, {
      firstName: 'Ada',
      lastName: 'Lovelace',
      password: 'short',
      age: 121,
    });
    const fields = errors.map((error) => error.property);

    expect(fields).toEqual(expect.arrayContaining(['email', 'password', 'age']));
    expect(errors.find((error) => error.property === 'password')?.constraints).toMatchObject({
      minLength: 'Password must be at least 8 characters long',
    });
  });
});

describe('UpdateUserDto', () => {
  it('accepts an empty body and a partial update', async () => {
    expect(await validationErrors(UpdateUserDto, {})).toEqual([]);
    expect(
      await validationErrors(UpdateUserDto, { firstName: 'Augusta' }),
    ).toEqual([]);
  });

  it('rejects a short replacement password and a non-email address', async () => {
    const errors = await validationErrors(UpdateUserDto, {
      email: 'not-an-email',
      password: 'short',
    });

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['email', 'password']),
    );
  });
});

describe('UserIdParamDto', () => {
  it('accepts a user id', async () => {
    expect(await validationErrors(UserIdParamDto, { id: userIdExample })).toEqual([]);
  });

  it('rejects an empty id', async () => {
    const errors = await validationErrors(UserIdParamDto, { id: '' });

    expect(errors.map((error) => error.property)).toContain('id');
  });
});
