import {
  createUserExample,
  userResponseExample,
} from '../../users/dto/user.examples.js';

export const loginExample = {
  email: createUserExample.email,
  password: createUserExample.password,
};

export const accessTokenExample = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.signature';

export const refreshExpiresAtExample = '2026-11-14T15:00:00.000Z';

export const loginResponseExample = {
  accessToken: accessTokenExample,
  refreshExpiresAt: refreshExpiresAtExample,
  user: userResponseExample,
};
