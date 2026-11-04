import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createUserExample, userIdExample } from './dto/user.examples.js';
import { UsersService } from './users.service.js';

function missingRecord() {
  return new Prisma.PrismaClientKnownRequestError('No record found', {
    code: 'P2025',
    clientVersion: 'test',
  });
}

describe('UsersService', () => {
  let service: UsersService;
  const userDelegate = {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: { user: userDelegate } },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  it('hashes the password and omits it from the created user', async () => {
    const stored = { id: userIdExample, email: createUserExample.email };
    userDelegate.create.mockResolvedValue(stored);

    await expect(service.createUser(createUserExample)).resolves.toBe(stored);

    const args = userDelegate.create.mock.calls[0][0];
    expect(args.omit).toEqual({ password: true });
    expect(args.data).toMatchObject({
      firstName: createUserExample.firstName,
      lastName: createUserExample.lastName,
      email: createUserExample.email,
      age: createUserExample.age,
    });
    expect(args.data.password).not.toBe(createUserExample.password);
    expect(args.data.password.startsWith('scrypt$')).toBe(true);
  });

  it('lists users without returning passwords', async () => {
    const users = [{ id: userIdExample }];
    userDelegate.findMany.mockResolvedValue(users);

    await expect(service.findAllUsers()).resolves.toBe(users);
    expect(userDelegate.findMany).toHaveBeenCalledWith({
      omit: { password: true },
    });
  });

  it('loads one user by id without returning the password', async () => {
    const stored = { id: userIdExample };
    userDelegate.findUnique.mockResolvedValue(stored);

    await expect(service.findUserById(userIdExample)).resolves.toBe(stored);
    expect(userDelegate.findUnique).toHaveBeenCalledWith({
      where: { id: userIdExample },
      omit: { password: true },
    });
  });

  it('reports a missing user as not found', async () => {
    userDelegate.findUnique.mockResolvedValue(null);
    userDelegate.update.mockRejectedValue(missingRecord());
    userDelegate.delete.mockRejectedValue(missingRecord());

    await expect(service.findUserById(userIdExample)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(
      service.updateUser(userIdExample, { firstName: 'Augusta' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.deleteUser(userIdExample)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('hashes a replacement password on update', async () => {
    userDelegate.update.mockResolvedValue({ id: userIdExample });

    await service.updateUser(userIdExample, { password: 'NewSecret123' });

    const args = userDelegate.update.mock.calls[0][0];
    expect(args.where).toEqual({ id: userIdExample });
    expect(args.omit).toEqual({ password: true });
    expect(args.data.password).not.toBe('NewSecret123');
    expect(args.data.password.startsWith('scrypt$')).toBe(true);
  });

  it('leaves the stored password unchanged when an update omits it', async () => {
    userDelegate.update.mockResolvedValue({ id: userIdExample });

    await service.updateUser(userIdExample, { firstName: 'Augusta' });

    expect(userDelegate.update).toHaveBeenCalledWith({
      where: { id: userIdExample },
      data: { firstName: 'Augusta', password: undefined },
      omit: { password: true },
    });
  });

  it('passes Prisma password operations through without hashing them', async () => {
    const password: Prisma.StringFieldUpdateOperationsInput = {
      set: 'already-set',
    };
    userDelegate.update.mockResolvedValue({ id: userIdExample });

    await service.updateUser(userIdExample, { password });

    expect(userDelegate.update.mock.calls[0][0].data.password).toBe(password);
  });

  it('deletes a user by id and omits the password', async () => {
    const deleted = { id: userIdExample };
    userDelegate.delete.mockResolvedValue(deleted);

    await expect(service.deleteUser(userIdExample)).resolves.toBe(deleted);
    expect(userDelegate.delete).toHaveBeenCalledWith({
      where: { id: userIdExample },
      omit: { password: true },
    });
  });
});
