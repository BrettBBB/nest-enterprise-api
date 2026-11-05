import type { GridFields } from '../common/grid-query.js';

export const userGridFields = {
  firstName: 'string',
  lastName: 'string',
  email: 'string',
  age: 'number',
  createdAt: 'date',
  updatedAt: 'date',
} as const satisfies GridFields;

export const userQuickFilterFields = ['firstName', 'lastName', 'email'] as const;
