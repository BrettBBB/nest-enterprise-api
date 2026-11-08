import {
  clearRefreshCookie,
  readCookie,
  refreshCookieOptions,
  setRefreshCookie,
} from './session-tokens.js';

describe('refresh cookies', () => {
  const previousEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = previousEnv;
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
      expect.objectContaining({ httpOnly: true, path: '/auth' }),
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
