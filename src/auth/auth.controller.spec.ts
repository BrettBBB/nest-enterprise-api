import { Test, TestingModule } from '@nestjs/testing';
import { createUserExample, userResponseExample } from '../users/dto/user.examples.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { loginExample, loginResponseExample } from './dto/auth.examples.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = { login: vi.fn(), register: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(AuthController);
  });

  it('maps a login DTO onto the auth service', async () => {
    authService.login.mockResolvedValue(loginResponseExample);

    await expect(controller.login(loginExample)).resolves.toBe(
      loginResponseExample,
    );
    expect(authService.login).toHaveBeenCalledWith(
      loginExample.email,
      loginExample.password,
    );
  });

  it('maps a registration DTO onto the user model', async () => {
    authService.register.mockResolvedValue(loginResponseExample);

    await expect(controller.register(createUserExample)).resolves.toBe(
      loginResponseExample,
    );
    expect(authService.register).toHaveBeenCalledWith(createUserExample);
  });

  it('returns the claims extracted from the request', () => {
    const claims = {
      sub: userResponseExample.id,
      email: userResponseExample.email,
      isAdmin: userResponseExample.isAdmin,
    };

    expect(controller.me(claims)).toEqual(claims);
  });
});
