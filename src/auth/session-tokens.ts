import { accessTokenTtlSeconds, refreshTokenTtlSeconds } from '../env.validation.js';

export { accessTokenTtlSeconds, refreshTokenTtlSeconds };

export const refreshCookieName = 'refresh_token';

type CookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'none';
  path: string;
  maxAge?: number;
};

export type CookieResponse = {
  cookie(name: string, value: string, options: CookieOptions): void;
  clearCookie(name: string, options: CookieOptions): void;
};

function refreshCookieSettings(): CookieOptions {
  const secure = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    path: '/auth',
  };
}

export function refreshCookieOptions(): CookieOptions {
  return { ...refreshCookieSettings(), maxAge: refreshTokenTtlSeconds() * 1000 };
}

export function setRefreshCookie(response: CookieResponse, refreshToken: string) {
  response.cookie(refreshCookieName, refreshToken, refreshCookieOptions());
}

export function clearRefreshCookie(response: CookieResponse) {
  response.clearCookie(refreshCookieName, refreshCookieSettings());
}

export function readCookie(header: string | undefined, name: string) {
  if (!header) {
    return null;
  }

  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1) {
      continue;
    }
    const key = part.slice(0, separator).trim();
    if (key !== name) {
      continue;
    }
    return decodeURIComponent(part.slice(separator + 1).trim());
  }
  return null;
}
