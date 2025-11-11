import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response, CookieOptions, Request } from 'express';
import {
  AuthCookieConfig,
  AuthModuleConfig,
  loadAuthConfig,
  sanitizeBoolean,
  sanitizeCookieName,
  sanitizeSameSite,
  sanitizeTrimmedString,
  toPositiveNumber,
} from './auth-config.util';

export interface AuthCookiePayload {
  accessToken: {
    value: string;
  };
  refreshToken: {
    id: string;
    value: string;
  };
  csrfToken: string;
}

@Injectable()
export class AuthCookieService {
  private readonly authConfig: AuthModuleConfig;

  constructor(private readonly configService: ConfigService) {
    this.authConfig = loadAuthConfig(this.configService);
  }

  getCookieNames(): {
    access: string;
    refresh: string;
    csrf: string;
  } {
    const cookies = this.getCookiesConfig();
    return {
      access: sanitizeCookieName(cookies?.accessTokenName, 'access_token'),
      refresh: sanitizeCookieName(cookies?.refreshTokenName, 'refresh_token'),
      csrf: sanitizeCookieName(cookies?.csrfTokenName, 'csrf_token'),
    };
  }

  getRefreshTokenFromRequest(req: Request): string | undefined {
    const names = this.getCookieNames();
    const rawCookies = req.cookies;
    const cookies =
      rawCookies && typeof rawCookies === 'object'
        ? (rawCookies as Record<string, unknown>)
        : undefined;
    if (!cookies) {
      return undefined;
    }
    const value = cookies[names.refresh];
    if (typeof value === 'string') {
      return value;
    }
    if (Array.isArray(value)) {
      const firstString = value.find(
        (entry): entry is string => typeof entry === 'string',
      );
      if (firstString) {
        return firstString;
      }
    }
    return undefined;
  }

  setAuthCookies(res: Response, payload: AuthCookiePayload): void {
    const jwtExpiresIn = toPositiveNumber(this.authConfig.jwt?.expiresIn, 1);
    const refreshTokenTtl = toPositiveNumber(
      this.authConfig.refreshToken?.ttl,
      1,
    );
    const cookieNames = this.getCookieNames();

    const baseOptions = this.createBaseCookieOptions();

    const accessCookieOptions: CookieOptions = {
      ...baseOptions,
      maxAge: jwtExpiresIn * 1000,
    };

    const refreshCookieOptions: CookieOptions = {
      ...baseOptions,
      maxAge: refreshTokenTtl * 1000,
    };

    res.cookie(
      cookieNames.access,
      payload.accessToken.value,
      accessCookieOptions,
    );

    res.cookie(
      cookieNames.refresh,
      `${payload.refreshToken.id}.${payload.refreshToken.value}`,
      refreshCookieOptions,
    );

    res.cookie(cookieNames.csrf, payload.csrfToken, {
      ...refreshCookieOptions,
      httpOnly: false,
    });
  }

  clearAuthCookies(res: Response): void {
    const cookieNames = this.getCookieNames();
    const baseOptions = this.createBaseCookieOptions();

    res.clearCookie(cookieNames.access, baseOptions);
    res.clearCookie(cookieNames.refresh, baseOptions);
    res.clearCookie(cookieNames.csrf, {
      ...baseOptions,
      httpOnly: false,
    });
  }

  private createBaseCookieOptions(): CookieOptions {
    const cookies = this.getCookiesConfig();
    const sameSite = sanitizeSameSite(cookies?.sameSite);
    const pathCandidate = sanitizeTrimmedString(cookies?.path);
    const domainCandidate = sanitizeTrimmedString(cookies?.domain);

    const options: CookieOptions = {
      httpOnly: true,
      sameSite,
      secure: sanitizeBoolean(cookies?.secure, false),
      path: pathCandidate ?? '/',
    };

    if (domainCandidate) {
      options.domain = domainCandidate;
    }

    return options;
  }
  private getCookiesConfig(): AuthCookieConfig | undefined {
    return this.authConfig.cookies;
  }
}
