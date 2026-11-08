import {
  accessTokenTtlSeconds,
  clearRefreshCookie,
  readCookie,
  refreshCookieOptions,
  refreshTokenTtlSeconds,
  setRefreshCookie,
} from './session-tokens.js';

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}

describe('session lifetimes', () => {
  const previousAccess = process.env.ACCESS_TOKEN_TTL_SECONDS;
  const previousRefresh = process.env.REFRESH_TOKEN_TTL_SECONDS;

  afterEach(() => {
    restoreEnv('ACCESS_TOKEN_TTL_SECONDS', previousAccess);
    restoreEnv('REFRESH_TOKEN_TTL_SECONDS', previousRefresh);
  });

  it('reads both lifetimes from the environment', () => {
    process.env.ACCESS_TOKEN_TTL_SECONDS = '120';
    process.env.REFRESH_TOKEN_TTL_SECONDS = '3600';

    expect(accessTokenTtlSeconds()).toBe(120);
    expect(refreshTokenTtlSeconds()).toBe(3600);
  });

  it('rejects a missing or non-integer lifetime', () => {
    delete process.env.ACCESS_TOKEN_TTL_SECONDS;

    expect(() => accessTokenTtlSeconds()).toThrow(/ACCESS_TOKEN_TTL_SECONDS/);

    process.env.ACCESS_TOKEN_TTL_SECONDS = '15m';

    expect(() => accessTokenTtlSeconds()).toThrow(/ACCESS_TOKEN_TTL_SECONDS/);
  });
});

describe('refresh cookies', () => {
  const previousEnv = process.env.NODE_ENV;
  const previousRefresh = process.env.REFRESH_TOKEN_TTL_SECONDS;

  beforeEach(() => {
    process.env.REFRESH_TOKEN_TTL_SECONDS = '3600';
  });

  afterEach(() => {
    process.env.NODE_ENV = previousEnv;
    restoreEnv('REFRESH_TOKEN_TTL_SECONDS', previousRefresh);
  });

  it('uses a lax cookie on a local http origin', () => {
    process.env.NODE_ENV = 'development';

    expect(refreshCookieOptions()).toMatchObject({
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/auth',
    });
  });

  it('uses a secure cross-site cookie in production', () => {
    process.env.NODE_ENV = 'production';

    expect(refreshCookieOptions()).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
  });

  it('sets and clears the refresh cookie without returning it to script', () => {
    const response = { cookie: vi.fn(), clearCookie: vi.fn() };

    setRefreshCookie(response, 'refresh-token');
    clearRefreshCookie(response);

    expect(response.cookie).toHaveBeenCalledWith(
      'refresh_token',
      'refresh-token',
      expect.objectContaining({ httpOnly: true, path: '/auth', maxAge: 3_600_000 }),
    );
    expect(response.clearCookie).toHaveBeenCalledWith(
      'refresh_token',
      expect.not.objectContaining({ maxAge: expect.any(Number) }),
    );
  });

  it('reads one named cookie from the request header', () => {
    expect(readCookie('theme=dark; refresh_token=abc%3D', 'refresh_token')).toBe('abc=');
    expect(readCookie(undefined, 'refresh_token')).toBeNull();
  });
});
