import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { loginExample, loginResponseExample } from './dto/auth.examples.js';
import { createUserExample, userResponseExample } from '../users/dto/user.examples.js';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let service: AuthService;
  const usersService = {
    authenticateUser: vi.fn(),
    createUser: vi.fn(),
  };
  const jwtService = { signAsync: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('issues a token for the user whose credentials match', async () => {
    usersService.authenticateUser.mockResolvedValue(userResponseExample);
    jwtService.signAsync.mockResolvedValue(loginResponseExample.accessToken);

    await expect(
      service.login(loginExample.email, loginExample.password),
    ).resolves.toEqual(loginResponseExample);
    expect(usersService.authenticateUser).toHaveBeenCalledWith(
      loginExample.email,
      loginExample.password,
    );
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: userResponseExample.id,
      email: userResponseExample.email,
    });
  });

  it('creates an account and issues a token', async () => {
    usersService.createUser.mockResolvedValue(userResponseExample);
    jwtService.signAsync.mockResolvedValue(loginResponseExample.accessToken);

    await expect(service.register(createUserExample)).resolves.toEqual(
      loginResponseExample,
    );
    expect(usersService.createUser).toHaveBeenCalledWith(createUserExample);
  });
});
