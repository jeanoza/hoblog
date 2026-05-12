import {
  accessCookieOptions,
  refreshCookieOptions,
  setAuthCookies,
  clearAuthCookies,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from './auth-cookie';
import { Response } from 'express';

const mockRes = {
  cookie: jest.fn(),
  clearCookie: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

describe('accessCookieOptions', () => {
  it('sets httpOnly, sameSite lax, and 15 min maxAge', () => {
    const opts = accessCookieOptions();

    expect(opts.httpOnly).toBe(true);
    expect(opts.sameSite).toBe('lax');
    expect(opts.maxAge).toBe(15 * 60 * 1000);
    expect(opts.path).toBe('/');
  });

  it('sets secure=true in production', () => {
    process.env.NODE_ENV = 'production';
    expect(accessCookieOptions().secure).toBe(true);
    delete process.env.NODE_ENV;
  });

  it('sets secure=false outside production', () => {
    process.env.NODE_ENV = 'development';
    expect(accessCookieOptions().secure).toBe(false);
    delete process.env.NODE_ENV;
  });
});

describe('refreshCookieOptions', () => {
  it('sets 7 day maxAge', () => {
    const opts = refreshCookieOptions();

    expect(opts.maxAge).toBe(7 * 24 * 60 * 60 * 1000);
  });
});

describe('setAuthCookies', () => {
  it('sets access and refresh cookies with correct names', () => {
    setAuthCookies(mockRes as unknown as Response, {
      accessToken: 'acc.token',
      refreshToken: 'ref.token',
    });

    expect(mockRes.cookie).toHaveBeenCalledTimes(2);
    expect(mockRes.cookie).toHaveBeenCalledWith(
      ACCESS_TOKEN_COOKIE,
      'acc.token',
      expect.any(Object)
    );
    expect(mockRes.cookie).toHaveBeenCalledWith(
      REFRESH_TOKEN_COOKIE,
      'ref.token',
      expect.any(Object)
    );
  });
});

describe('clearAuthCookies', () => {
  it('clears access and refresh cookies', () => {
    clearAuthCookies(mockRes as unknown as Response);

    expect(mockRes.clearCookie).toHaveBeenCalledTimes(2);
    expect(mockRes.clearCookie).toHaveBeenCalledWith(ACCESS_TOKEN_COOKIE, {
      path: '/',
    });
    expect(mockRes.clearCookie).toHaveBeenCalledWith(REFRESH_TOKEN_COOKIE, {
      path: '/',
    });
  });
});
