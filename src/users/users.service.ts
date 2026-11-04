import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, type User } from '../../generated/prisma/client.js';
import { rethrowUnlessMissing } from '../common/functions.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { hashPassword, verifyPassword } from './password.js';

const omitPassword = { password: true } as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data: {
        ...data,
        password: await hashPassword(data.password),
      },
      omit: omitPassword,
    });
  }

  findAllUsers() {
    return this.prisma.user.findMany({ omit: omitPassword });
  }

  async authenticateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { password: storedPassword, ...profile } = user;
    if (!(await verifyPassword(password, storedPassword))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return profile;
  }

  async findUserById(id: User['id']) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      omit: omitPassword,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUser(id: User['id'], data: Prisma.UserUpdateInput) {
    const password =
      typeof data.password === 'string'
        ? await hashPassword(data.password)
        : data.password;

    try {
      return await this.prisma.user.update({
        where: { id },
        data: { ...data, password },
        omit: omitPassword,
      });
    } catch (error) {
      rethrowUnlessMissing(error, 'User not found');
    }
  }

  async deleteUser(id: User['id']) {
    try {
      return await this.prisma.user.delete({
        where: { id },
        omit: omitPassword,
      });
    } catch (error) {
      rethrowUnlessMissing(error, 'User not found');
    }
  }
}
