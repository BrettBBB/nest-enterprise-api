import { Test, TestingModule } from '@nestjs/testing';
import { createUserExample, userResponseExample } from '../users/dto/user.examples.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { loginExample, loginResponseExample } from './dto/auth.examples.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}

describe('AuthController', () => {
  let controller: AuthController;
  const authService = { login: vi.fn(), register: vi.fn(), refresh: vi.fn() };
  const response = { cookie: vi.fn(), clearCookie: vi.fn() };
  const previousRefresh = process.env.REFRESH_TOKEN_TTL_SECONDS;

  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.REFRESH_TOKEN_TTL_SECONDS = '3600';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(AuthController);
  });

  afterEach(() => {
    restoreEnv('REFRESH_TOKEN_TTL_SECONDS', previousRefresh);
  });

  it('maps a login DTO onto the auth service and sets the refresh cookie', async () => {
    authService.login.mockResolvedValue({
      ...loginResponseExample,
      refreshToken: 'refresh-token',
    });

    await expect(controller.login(loginExample, response)).resolves.toEqual(loginResponseExample);
    expect(authService.login).toHaveBeenCalledWith(
      loginExample.email,
      loginExample.password,
    );
    expect(response.cookie).toHaveBeenCalledWith(
      'refresh_token',
      'refresh-token',
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it('maps a registration DTO onto the user model and sets the refresh cookie', async () => {
    authService.register.mockResolvedValue({
      ...loginResponseExample,
      refreshToken: 'refresh-token',
    });

    await expect(controller.register(createUserExample, response)).resolves.toEqual(
      loginResponseExample,
    );
    expect(authService.register).toHaveBeenCalledWith(createUserExample);
  });

  it('reads the refresh cookie and returns a new access token', async () => {
    authService.refresh.mockResolvedValue({
      ...loginResponseExample,
      refreshToken: 'next-refresh',
    });

    await expect(controller.refresh('refresh_token=current-token', response)).resolves.toEqual(
      loginResponseExample,
    );
    expect(authService.refresh).toHaveBeenCalledWith('current-token');
  });

  it('clears the refresh cookie on logout', () => {
    controller.logout(response);

    expect(response.clearCookie).toHaveBeenCalledWith(
      'refresh_token',
      expect.objectContaining({ path: '/auth' }),
    );
  });

  it('returns the claims extracted from the request', () => {
    const claims = {
      sub: userResponseExample.id,
      email: userResponseExample.email,
      isAdmin: userResponseExample.isAdmin,
      role: 'user' as const,
      type: 'access' as const,
    };

    expect(controller.me(claims)).toEqual(claims);
  });
});
