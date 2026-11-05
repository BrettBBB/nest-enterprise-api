export const userIdExample = 'cm3k1sampleuser00000000001';

export const createUserExample = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  password: 'ChangeMe123',
  age: 36,
};

export const updateUserExample = {
  firstName: 'Augusta',
  lastName: 'King',
  email: 'augusta@example.com',
  age: 37,
};

export const userResponseExample = {
  id: userIdExample,
  firstName: createUserExample.firstName,
  lastName: createUserExample.lastName,
  email: createUserExample.email,
  age: createUserExample.age,
  isAdmin: false,
  createdAt: '2026-11-04T15:00:00.000Z',
  updatedAt: '2026-11-04T15:00:00.000Z',
};

export const userPageExample = {
  rows: [userResponseExample],
  rowCount: 1,
};
