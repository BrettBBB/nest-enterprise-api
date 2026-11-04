import { Injectable } from '@nestjs/common';
import { Prisma, type User } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { hashPassword } from './password.js';

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

  findUserById(id: User['id']) {
    return this.prisma.user.findUnique({
      where: { id },
      omit: omitPassword,
    });
  }

  async updateUser(id: User['id'], data: Prisma.UserUpdateInput) {
    const password =
      typeof data.password === 'string'
        ? await hashPassword(data.password)
        : data.password;

    return this.prisma.user.update({
      where: { id },
      data: { ...data, password },
      omit: omitPassword,
    });
  }

  deleteUser(id: User['id']) {
    return this.prisma.user.delete({
      where: { id },
      omit: omitPassword,
    });
  }
}
