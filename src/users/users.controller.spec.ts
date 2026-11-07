import { Test, TestingModule } from '@nestjs/testing';
import { AdminGuard } from '../auth/admin.guard.js';
import { parseGridQuery, toGridListArgs } from '../common/grid-query.js';
import {
  createUserExample,
  updateUserExample,
  userIdExample,
  userResponseExample,
} from './dto/user.examples.js';
import { userGridFields, userQuickFilterFields } from './user-grid.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

describe('UsersController', () => {
  let controller: UsersController;
  const usersService = {
    createUser: vi.fn(),
    findUsers: vi.fn(),
    findUserById: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(UsersController);
  });

  it('maps a create DTO onto the user model', async () => {
    usersService.createUser.mockResolvedValue(userResponseExample);

    await expect(controller.create(createUserExample)).resolves.toBe(
      userResponseExample,
    );
    expect(usersService.createUser).toHaveBeenCalledWith(createUserExample);
  });

  it('maps a grid query onto a database page', async () => {
    const grid = JSON.stringify({
      paginationModel: { page: 1, pageSize: 25 },
      sortModel: [{ field: 'lastName', sort: 'asc' }],
      filterModel: {
        items: [{ field: 'age', operator: '>=', value: 30 }],
        quickFilterValues: ['ada'],
      },
    });
    usersService.findUsers.mockResolvedValue({
      rows: [userResponseExample],
      rowCount: 40,
    });

    await expect(controller.findAll(grid)).resolves.toEqual({
      rows: [userResponseExample],
      rowCount: 40,
    });
    expect(usersService.findUsers).toHaveBeenCalledWith(
      toGridListArgs(await parseGridQuery(grid), {
        fields: userGridFields,
        quickFilterFields: userQuickFilterFields,
      }),
    );
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
      isAdmin: updateUserExample.isAdmin,
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
