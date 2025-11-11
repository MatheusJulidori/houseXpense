import { Injectable } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import authConfig from '../../config/auth.config';

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
    const authConfigValues =
      configService.get<ConfigType<typeof authConfig>>('auth');
    const jwtConfig = authConfigValues?.jwt;

    if (!jwtConfig?.secret) {
      throw new Error('JWT secret is not configured.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
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
