import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import {
  loadAuthConfig,
  sanitizeCookieName,
  pickCookieContainer,
} from '../application/auth-config.util';

interface JwtPayload {
  sub: string;
  username: string;
}

interface UserPayload {
  userId: string;
  username: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    const authConfigValues = loadAuthConfig(configService);
    const jwtConfig = authConfigValues.jwt;
    const cookieConfig = authConfigValues.cookies;

    if (!jwtConfig?.secret || !jwtConfig.secret.trim()) {
      throw new Error('JWT secret is not configured.');
    }

    const cookieName = sanitizeCookieName(
      cookieConfig?.accessTokenName,
      'access_token',
    );

    const cookieExtractor = (req: Request): string | null => {
      if (!req || !req.cookies) {
        return null;
      }
      const cookies = pickCookieContainer(req.cookies);
      const tokenCandidate = cookies[cookieName];
      if (typeof tokenCandidate === 'string') {
        return tokenCandidate;
      }
      if (Array.isArray(tokenCandidate)) {
        const first = tokenCandidate.find(
          (entry): entry is string => typeof entry === 'string',
        );
        return first ?? null;
      }
      return null;
    };

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  validate(payload: JwtPayload): UserPayload {
    // Return userId for consistency with controller expectations
    return {
      userId: payload.sub,
      username: payload.username,
    };
  }
}
