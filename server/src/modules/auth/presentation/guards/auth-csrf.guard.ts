import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import {
  AuthModuleConfig,
  loadAuthConfig,
  normalizeHeaderName,
  sanitizeCookieName,
  pickCookieContainer,
} from '../../application/auth-config.util';

@Injectable()
export class AuthCsrfGuard implements CanActivate {
  private readonly authConfig: AuthModuleConfig;

  constructor(private readonly configService: ConfigService) {
    this.authConfig = loadAuthConfig(this.configService);
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const cookies = pickCookieContainer(request.cookies);

    const headerName = normalizeHeaderName(
      this.authConfig.csrf?.headerName,
      'x-csrf-token',
    );
    const cookieName = sanitizeCookieName(
      this.authConfig.cookies?.csrfTokenName,
      'csrf_token',
    );

    const headerValue = this.extractHeader(request, headerName);
    const cookieRaw = cookies[cookieName];
    const cookieValue =
      typeof cookieRaw === 'string'
        ? cookieRaw
        : Array.isArray(cookieRaw)
          ? cookieRaw.find(
              (entry): entry is string => typeof entry === 'string',
            )
          : undefined;

    if (!headerValue || !cookieValue || headerValue !== cookieValue) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }

  private extractHeader(request: Request, headerName: string): string | null {
    const direct = request.headers[headerName];
    if (!direct) {
      return null;
    }
    if (Array.isArray(direct)) {
      return direct[0] ?? null;
    }
    return direct;
  }
}
