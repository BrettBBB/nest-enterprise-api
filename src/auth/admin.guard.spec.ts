import {
  ForbiddenException,
  UnauthorizedException,
  type ExecutionContext,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminGuard } from './admin.guard.js';
import type { AuthenticatedRequest } from './jwt-auth.guard.js';

function contextFor(authorization?: string) {
  const request: AuthenticatedRequest = {
    headers: { authorization },
  };
  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
  return { context, request };
}

describe('AdminGuard', () => {
  const jwtService = { verifyAsync: vi.fn() };
  const guard = new AdminGuard(jwtService as unknown as JwtService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects a request without a bearer token', async () => {
    const { context } = contextFor();

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects a signed-in user who is not an administrator', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 'user-id',
      email: 'ada@example.com',
      isAdmin: false,
    });
    const { context } = contextFor('Bearer signed-token');

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('allows an administrator token', async () => {
    const claims = { sub: 'user-id', email: 'ada@example.com', isAdmin: true };
    jwtService.verifyAsync.mockResolvedValue(claims);
    const { context, request } = contextFor('Bearer signed-token');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual(claims);
  });
});
