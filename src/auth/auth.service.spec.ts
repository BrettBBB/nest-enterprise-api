import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { loginExample, loginResponseExample } from './dto/auth.examples.js';
import { createUserExample, userResponseExample } from '../users/dto/user.examples.js';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';
import { refreshTokenTtlSeconds } from './session-tokens.js';

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}

describe('AuthService', () => {
  let service: AuthService;
  const usersService = {
    authenticateUser: vi.fn(),
    createUser: vi.fn(),
    findUserById: vi.fn(),
  };
  const jwtService = { signAsync: vi.fn(), verifyAsync: vi.fn() };
  const previousRefresh = process.env.REFRESH_TOKEN_TTL_SECONDS;

  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.REFRESH_TOKEN_TTL_SECONDS = '3600';
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  afterEach(() => {
    restoreEnv('REFRESH_TOKEN_TTL_SECONDS', previousRefresh);
  });

  it('issues an access token and a refresh token for matching credentials', async () => {
    usersService.authenticateUser.mockResolvedValue(userResponseExample);
    jwtService.signAsync
      .mockResolvedValueOnce(loginResponseExample.accessToken)
      .mockResolvedValueOnce('refresh-token');

    const before = Date.now();
    const session = await service.login(loginExample.email, loginExample.password);

    expect(session.accessToken).toBe(loginResponseExample.accessToken);
    expect(session.refreshToken).toBe('refresh-token');
    expect(session.user).toEqual(userResponseExample);
    expect(Date.parse(session.refreshExpiresAt)).toBeGreaterThanOrEqual(
      before + refreshTokenTtlSeconds() * 1000,
    );
    expect(usersService.authenticateUser).toHaveBeenCalledWith(
      loginExample.email,
      loginExample.password,
    );
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(1, {
      sub: userResponseExample.id,
      email: userResponseExample.email,
      isAdmin: false,
      role: 'user',
      type: 'access',
    });
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      2,
      { sub: userResponseExample.id, type: 'refresh' },
      { expiresIn: refreshTokenTtlSeconds() },
    );
  });

  it('creates an account and issues both tokens', async () => {
    usersService.createUser.mockResolvedValue(userResponseExample);
    jwtService.signAsync.mockResolvedValue(loginResponseExample.accessToken);

    await expect(service.register(createUserExample)).resolves.toMatchObject({
      accessToken: loginResponseExample.accessToken,
      user: userResponseExample,
    });
    expect(usersService.createUser).toHaveBeenCalledWith(createUserExample);
  });

  it('renews both tokens from a refresh token and the current user', async () => {
    usersService.findUserById.mockResolvedValue({ ...userResponseExample, isAdmin: true });
    jwtService.verifyAsync.mockResolvedValue({ sub: userResponseExample.id, type: 'refresh' });
    jwtService.signAsync.mockResolvedValueOnce('next-access').mockResolvedValueOnce('next-refresh');

    const session = await service.refresh('refresh-token');

    expect(session.user.isAdmin).toBe(true);
    expect(session.accessToken).toBe('next-access');
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ isAdmin: true, role: 'admin', type: 'access' }),
    );
  });

  it('treats a deleted user as an invalid refresh token', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: userResponseExample.id, type: 'refresh' });
    usersService.findUserById.mockRejectedValue(new NotFoundException('User not found'));

    await expect(service.refresh('refresh-token')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a missing or non-refresh token', async () => {
    await expect(service.refresh(null)).rejects.toBeInstanceOf(UnauthorizedException);

    jwtService.verifyAsync.mockResolvedValue({ sub: userResponseExample.id, type: 'access' });
    await expect(service.refresh('access-token')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(usersService.findUserById).not.toHaveBeenCalled();
  });
});
