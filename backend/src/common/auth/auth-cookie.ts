import type { CookieOptions, Response } from 'express';

export const ACCESS_TOKEN_COOKIE = 'hoblog_access';
export const REFRESH_TOKEN_COOKIE = 'hoblog_refresh';

function baseOptions(maxAge: number): CookieOptions {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge,
    path: '/',
  };
}

export function accessCookieOptions(): CookieOptions {
  return baseOptions(15 * 60 * 1000);
}

export function refreshCookieOptions(): CookieOptions {
  return baseOptions(7 * 24 * 60 * 60 * 1000);
}

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string }
): void {
  res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, accessCookieOptions());
  res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, refreshCookieOptions());
}

export function clearAuthCookies(res: Response): void {
  const path = '/';
  res.clearCookie(ACCESS_TOKEN_COOKIE, { path });
  res.clearCookie(REFRESH_TOKEN_COOKIE, { path });
}
