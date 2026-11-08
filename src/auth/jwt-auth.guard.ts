import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AccessTokenPayload } from './access-token.js';

export type AuthenticatedRequest = {
  headers: { authorization?: string };
  user?: AccessTokenPayload;
};

function bearerToken(authorization?: string) {
  const [scheme, token] = authorization?.split(' ') ?? [];
  if (scheme !== 'Bearer' || !token) {
    return null;
  }
  return token;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = bearerToken(request.headers.authorization);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      request.user = await this.jwtService.verifyAsync<AccessTokenPayload>(token);
      if (request.user.type !== 'access' || typeof request.user.isAdmin !== 'boolean') {
        throw new UnauthorizedException();
      }
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
