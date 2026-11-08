import { Prisma } from '../../generated/prisma/client.js';
import type { CreateUserDto } from './dto/create-user.dto.js';
import type { UpdateUserDto } from './dto/update-user.dto.js';

export function toUserCreateInput(dto: CreateUserDto): Prisma.UserCreateInput {
  return {
    firstName: dto.firstName,
    lastName: dto.lastName,
    email: dto.email,
    password: dto.password,
    age: dto.age,
  };
}

export function toUserUpdateInput(dto: UpdateUserDto): Prisma.UserUpdateInput {
  return {
    firstName: dto.firstName,
    lastName: dto.lastName,
    email: dto.email,
    password: dto.password,
    age: dto.age,
    isAdmin: dto.isAdmin,
  };
}
