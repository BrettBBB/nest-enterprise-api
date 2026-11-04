import {
  createUserExample,
  userResponseExample,
} from '../../users/dto/user.examples.js';

export const loginExample = {
  email: createUserExample.email,
  password: createUserExample.password,
};

export const accessTokenExample = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.signature';

export const loginResponseExample = {
  accessToken: accessTokenExample,
  user: userResponseExample,
};
