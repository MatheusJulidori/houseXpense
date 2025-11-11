import { registerAs } from '@nestjs/config';

const parseNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

type SameSiteOption = 'strict' | 'lax' | 'none';

const resolveSameSite = (value: string | undefined): SameSiteOption => {
  const normalized = (value ?? 'strict').toLowerCase();
  if (normalized === 'lax' || normalized === 'none') {
    return normalized;
  }
  return 'strict';
};

export default registerAs('auth', () => {
  const accessTokenTtl = parseNumber(
    process.env.AUTH_ACCESS_TOKEN_TTL,
    60 * 60 * 24, // 24h
  );

  const refreshTokenTtl = parseNumber(
    process.env.AUTH_REFRESH_TOKEN_TTL,
    60 * 60 * 24 * 7, // 7d
  );

  const rateLimitTtl = parseNumber(process.env.AUTH_RATE_LIMIT_TTL, 60);
  const rateLimitLimit = parseNumber(process.env.AUTH_RATE_LIMIT_LIMIT, 10);

  const accessSecret =
    process.env.AUTH_ACCESS_TOKEN_SECRET ?? process.env.JWT_SECRET ?? '';

  const refreshSecret = process.env.AUTH_REFRESH_TOKEN_SECRET ?? accessSecret;

  if (!accessSecret) {
    throw new Error('JWT secret is not configured.');
  }

  return {
    jwt: {
      secret: accessSecret,
      expiresIn: accessTokenTtl,
    },
    refreshToken: {
      secret: refreshSecret,
      ttl: refreshTokenTtl,
    },
    cookies: {
      accessTokenName: process.env.AUTH_ACCESS_COOKIE_NAME ?? 'access_token',
      refreshTokenName: process.env.AUTH_REFRESH_COOKIE_NAME ?? 'refresh_token',
      csrfTokenName: process.env.AUTH_CSRF_COOKIE_NAME ?? 'csrf_token',
      domain: process.env.AUTH_COOKIE_DOMAIN ?? undefined,
      path: process.env.AUTH_COOKIE_PATH ?? '/',
      sameSite: resolveSameSite(process.env.AUTH_COOKIE_SAME_SITE),
      secure:
        (process.env.AUTH_COOKIE_SECURE ?? 'false').toLowerCase() === 'true',
    },
    csrf: {
      headerName: process.env.AUTH_CSRF_HEADER_NAME ?? 'x-csrf-token',
    },
    rateLimit: {
      ttl: rateLimitTtl,
      limit: rateLimitLimit,
    },
  };
});
