export type AccessRole = 'admin' | 'user';

export type AccessTokenPayload = {
  sub: string;
  email: string;
  isAdmin: boolean;
  role: AccessRole;
  type: 'access';
};
