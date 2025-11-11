import type { CookieOptions } from 'express';
import { ConfigService } from '@nestjs/config';
import authConfigFactory from '../../../config/auth.config';

type Primitive = string | number | boolean | null | undefined;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isOptionalString = (value: unknown): value is string | undefined =>
  value === undefined || typeof value === 'string';

const isOptionalFiniteNumber = (value: unknown): value is number | undefined =>
  value === undefined || (typeof value === 'number' && Number.isFinite(value));

const isOptionalBoolean = (value: unknown): value is boolean | undefined =>
  value === undefined || typeof value === 'boolean';

export interface AuthJwtConfig {
  secret?: string;
  expiresIn?: number;
}

export interface AuthRefreshTokenConfig {
  secret?: string;
  ttl?: number;
}

export interface AuthCookieConfig {
  accessTokenName?: string;
  refreshTokenName?: string;
  csrfTokenName?: string;
  domain?: string;
  path?: string;
  sameSite?: CookieOptions['sameSite'];
  secure?: boolean;
}

export interface AuthCsrfConfig {
  headerName?: string;
}

export interface AuthRateLimitConfig {
  ttl?: number;
  limit?: number;
}

export interface AuthModuleConfig {
  jwt?: AuthJwtConfig;
  refreshToken?: AuthRefreshTokenConfig;
  cookies?: AuthCookieConfig;
  csrf?: AuthCsrfConfig;
  rateLimit?: AuthRateLimitConfig;
}

const isAuthJwtConfig = (value: unknown): value is AuthJwtConfig => {
  if (!isObject(value)) {
    return false;
  }
  const { secret, expiresIn } = value;
  return isOptionalString(secret) && isOptionalFiniteNumber(expiresIn);
};

const isAuthRefreshTokenConfig = (
  value: unknown,
): value is AuthRefreshTokenConfig => {
  if (!isObject(value)) {
    return false;
  }
  const { secret, ttl } = value;
  return isOptionalString(secret) && isOptionalFiniteNumber(ttl);
};

const isSameSiteValue = (
  value: unknown,
): value is CookieOptions['sameSite'] => {
  if (value === true || value === false) {
    return true;
  }
  return value === 'strict' || value === 'lax' || value === 'none';
};

const isAuthCookieConfig = (value: unknown): value is AuthCookieConfig => {
  if (!isObject(value)) {
    return false;
  }
  const {
    accessTokenName,
    refreshTokenName,
    csrfTokenName,
    domain,
    path,
    sameSite,
    secure,
  } = value;

  return (
    isOptionalString(accessTokenName) &&
    isOptionalString(refreshTokenName) &&
    isOptionalString(csrfTokenName) &&
    isOptionalString(domain) &&
    isOptionalString(path) &&
    (sameSite === undefined || isSameSiteValue(sameSite)) &&
    isOptionalBoolean(secure)
  );
};

const isAuthCsrfConfig = (value: unknown): value is AuthCsrfConfig => {
  if (!isObject(value)) {
    return false;
  }
  const { headerName } = value;
  return isOptionalString(headerName);
};

const isAuthRateLimitConfig = (
  value: unknown,
): value is AuthRateLimitConfig => {
  if (!isObject(value)) {
    return false;
  }
  const { ttl, limit } = value;
  return isOptionalFiniteNumber(ttl) && isOptionalFiniteNumber(limit);
};

export const isAuthModuleConfig = (
  value: unknown,
): value is AuthModuleConfig => {
  if (!isObject(value)) {
    return false;
  }
  const { jwt, refreshToken, cookies, csrf, rateLimit } = value;

  return (
    (jwt === undefined || isAuthJwtConfig(jwt)) &&
    (refreshToken === undefined || isAuthRefreshTokenConfig(refreshToken)) &&
    (cookies === undefined || isAuthCookieConfig(cookies)) &&
    (csrf === undefined || isAuthCsrfConfig(csrf)) &&
    (rateLimit === undefined || isAuthRateLimitConfig(rateLimit))
  );
};

export const loadAuthConfig = (
  configService: ConfigService,
): AuthModuleConfig => {
  const candidate = configService.get<unknown>('auth');
  if (candidate !== undefined) {
    if (isAuthModuleConfig(candidate)) {
      return candidate;
    }
    throw new Error('Invalid auth configuration loaded from ConfigService');
  }

  const fallback = authConfigFactory();
  if (!isAuthModuleConfig(fallback)) {
    throw new Error('Generated auth configuration is invalid');
  }
  return fallback;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export const sanitizeCookieName = (
  candidate: unknown,
  fallback: string,
): string => {
  if (isNonEmptyString(candidate)) {
    return candidate.trim();
  }
  return fallback;
};

export const sanitizeTrimmedString = (
  candidate: unknown,
): string | undefined => {
  if (isNonEmptyString(candidate)) {
    return candidate.trim();
  }
  return undefined;
};

export const toPositiveNumber = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }
  return fallback;
};

export const sanitizeSameSite = (
  candidate: unknown,
): CookieOptions['sameSite'] => {
  if (candidate === true || candidate === false) {
    return candidate;
  }
  if (candidate === 'strict' || candidate === 'lax' || candidate === 'none') {
    return candidate;
  }
  return 'strict';
};

export const sanitizeBoolean = (
  candidate: unknown,
  fallback = false,
): boolean => {
  if (typeof candidate === 'boolean') {
    return candidate;
  }
  return fallback;
};

export const normalizeHeaderName = (
  candidate: unknown,
  fallback: string,
): string => {
  if (isNonEmptyString(candidate)) {
    return candidate.trim().toLowerCase();
  }
  return fallback.toLowerCase();
};

export const pickCookieContainer = (
  value: unknown,
): Record<string, Primitive | Primitive[]> => {
  if (!isObject(value)) {
    return {};
  }

  return Object.entries(value).reduce<Record<string, Primitive | Primitive[]>>(
    (acc, [key, entry]) => {
      if (
        typeof entry === 'string' ||
        typeof entry === 'number' ||
        typeof entry === 'boolean' ||
        entry === null ||
        entry === undefined
      ) {
        acc[key] = entry;
        return acc;
      }
      if (Array.isArray(entry)) {
        const filtered = entry.filter((item): item is Primitive => {
          const itemType = typeof item;
          return (
            itemType === 'string' ||
            itemType === 'number' ||
            itemType === 'boolean' ||
            item === null ||
            item === undefined
          );
        });
        if (filtered.length > 0) {
          acc[key] = filtered;
        }
      }
      return acc;
    },
    {},
  );
};
