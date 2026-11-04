import { NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';

export function trimString({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export function rethrowUnlessMissing(
  error: unknown,
  message = 'Record not found',
): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2025'
  ) {
    throw new NotFoundException(message);
  }
  throw error;
}
