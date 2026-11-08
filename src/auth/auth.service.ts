import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '../../generated/prisma/client.js';
import { UsersService } from '../users/users.service.js';

type AuthenticatedUser = {
  id: string;
  email: string;
  isAdmin: boolean;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.authenticateUser(email, password);
    return this.issueToken(user);
  }

  async register(data: Prisma.UserCreateInput) {
    const user = await this.usersService.createUser(data);
    return this.issueToken(user);
  }

  private async issueToken(user: AuthenticatedUser) {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.isAdmin ? 'admin' : 'user',
    });
    return { accessToken, user };
  }
}
