import { Test, TestingModule } from '@nestjs/testing';
import {
  createUserExample,
  updateUserExample,
  userIdExample,
  userResponseExample,
} from './dto/user.examples.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

describe('UsersController', () => {
  let controller: UsersController;
  const usersService = {
    createUser: vi.fn(),
    findAllUsers: vi.fn(),
    findUserById: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = module.get(UsersController);
  });

  it('maps a create DTO onto the user model', async () => {
    usersService.createUser.mockResolvedValue(userResponseExample);

    await expect(controller.create(createUserExample)).resolves.toBe(
      userResponseExample,
    );
    expect(usersService.createUser).toHaveBeenCalledWith(createUserExample);
  });

  it('returns every user from the service', async () => {
    usersService.findAllUsers.mockResolvedValue([userResponseExample]);

    await expect(controller.findAll()).resolves.toEqual([userResponseExample]);
  });

  it('loads a user with the id from the route params', async () => {
    usersService.findUserById.mockResolvedValue(userResponseExample);

    await expect(controller.findOne({ id: userIdExample })).resolves.toBe(
      userResponseExample,
    );
    expect(usersService.findUserById).toHaveBeenCalledWith(userIdExample);
  });

  it('maps an update DTO onto the user model', async () => {
    const updated = { ...userResponseExample, ...updateUserExample };
    usersService.updateUser.mockResolvedValue(updated);

    await expect(
      controller.update({ id: userIdExample }, updateUserExample),
    ).resolves.toBe(updated);
    expect(usersService.updateUser).toHaveBeenCalledWith(userIdExample, {
      firstName: updateUserExample.firstName,
      lastName: updateUserExample.lastName,
      email: updateUserExample.email,
      password: undefined,
      age: updateUserExample.age,
    });
  });

  it('deletes a user with the id from the route params', async () => {
    usersService.deleteUser.mockResolvedValue(userResponseExample);

    await expect(controller.delete({ id: userIdExample })).resolves.toBe(
      userResponseExample,
    );
    expect(usersService.deleteUser).toHaveBeenCalledWith(userIdExample);
  });
});
