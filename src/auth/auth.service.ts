import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '../../generated/prisma/client.js';
import { UsersService } from '../users/users.service.js';
import { refreshTokenTtlSeconds } from './session-tokens.js';

type AuthenticatedUser = {
  id: string;
  email: string;
  isAdmin: boolean;
};

type RefreshPayload = {
  sub?: string;
  type?: string;
};

export type IssuedSession<TUser> = {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: string;
  user: TUser;
};

export function toLoginResponse<TUser>(session: IssuedSession<TUser>) {
  return {
    accessToken: session.accessToken,
    refreshExpiresAt: session.refreshExpiresAt,
    user: session.user,
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.authenticateUser(email, password);
    return this.issueSession(user);
  }

  async register(data: Prisma.UserCreateInput) {
    const user = await this.usersService.createUser(data);
    return this.issueSession(user);
  }

  async refresh(refreshToken: string | null) {
    const userId = await this.refreshSubject(refreshToken);
    try {
      const user = await this.usersService.findUserById(userId);
      return this.issueSession(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException();
      }
      throw error;
    }
  }

  private async refreshSubject(refreshToken: string | null) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync<RefreshPayload>(refreshToken);
      if (payload.type !== 'refresh' || typeof payload.sub !== 'string') {
        throw new UnauthorizedException();
      }
      return payload.sub;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException();
    }
  }

  private async issueSession<T extends AuthenticatedUser>(user: T): Promise<IssuedSession<T>> {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.isAdmin ? 'admin' : 'user',
      type: 'access',
    });
    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, type: 'refresh' },
      { expiresIn: refreshTokenTtlSeconds },
    );
    return {
      accessToken,
      refreshToken,
      refreshExpiresAt: new Date(Date.now() + refreshTokenTtlSeconds * 1000).toISOString(),
      user,
    };
  }
}
