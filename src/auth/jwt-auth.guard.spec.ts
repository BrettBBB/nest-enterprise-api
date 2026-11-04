import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard, type AuthenticatedRequest } from './jwt-auth.guard.js';

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

describe('JwtAuthGuard', () => {
  const jwtService = { verifyAsync: vi.fn() };
  const guard = new JwtAuthGuard(jwtService as unknown as JwtService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects a request without a bearer token', async () => {
    const { context } = contextFor();

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('rejects a token the signer does not accept', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid'));
    const { context } = contextFor('Bearer not-a-token');

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('stores the token claims on the request', async () => {
    const claims = { sub: 'user-id', email: 'ada@example.com' };
    jwtService.verifyAsync.mockResolvedValue(claims);
    const { context, request } = contextFor('Bearer signed-token');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('signed-token');
    expect(request.user).toEqual(claims);
  });
});
