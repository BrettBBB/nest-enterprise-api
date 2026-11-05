import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, type User } from '../../generated/prisma/client.js';
import { rethrowUnlessMissing } from '../common/functions.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { GridListArgs } from '../common/grid-query.js';
import {
  hashPassword,
  matchesLegacyPassword,
  verifyPassword,
} from './password.js';

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

  async findUsers(args: GridListArgs) {
    const where = args.where as Prisma.UserWhereInput;
    const [rows, rowCount] = await Promise.all([
      this.prisma.user.findMany({
        where,
        ...(args.orderBy ? { orderBy: args.orderBy } : {}),
        ...(args.skip != null ? { skip: args.skip } : {}),
        ...(args.take != null ? { take: args.take } : {}),
        omit: omitPassword,
      }),
      this.prisma.user.count({ where }),
    ]);
    return { rows, rowCount };
  }

  async authenticateUser(email: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { password: storedPassword, ...profile } = user;
    if (typeof storedPassword !== 'string' || storedPassword.length === 0) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (storedPassword.startsWith('scrypt$')) {
      if (!(await verifyPassword(password, storedPassword))) {
        throw new UnauthorizedException('Invalid email or password');
      }
      return profile;
    }

    if (!matchesLegacyPassword(password, storedPassword)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    try {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: await hashPassword(password) },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Could not store the password hash',
        { cause: error },
      );
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
