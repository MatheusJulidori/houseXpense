import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response, Request as ExpressRequest } from 'express';
import { plainToInstance } from 'class-transformer';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import {
  AuthService,
  AuthSession,
  SessionMetadata,
} from '../application/auth.service';
import { AuthCookieService } from '../application/auth-cookie.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LogMethod } from '../../../decorators/log.decorator';
import { JwtAuthGuard } from '../../../utils/jwt-auth.guard';
import { AuthSessionResponseDto } from './dto/auth-session-response.dto';
import { CurrentUserResponseDto } from './dto/current-user-response.dto';
import { AuthCsrfGuard } from './guards/auth-csrf.guard';
import {
  loadAuthConfig,
  normalizeHeaderName,
} from '../application/auth-config.util';

const parseRateLimitValue = (input: string | undefined, fallback: number) => {
  if (!input) {
    return fallback;
  }
  const parsed = Number(input);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const AUTH_RATE_LIMIT_LIMIT = parseRateLimitValue(
  process.env.AUTH_RATE_LIMIT_LIMIT,
  10,
);
const AUTH_RATE_LIMIT_TTL = parseRateLimitValue(
  process.env.AUTH_RATE_LIMIT_TTL,
  60,
);

const AUTH_THROTTLE_OPTIONS: Parameters<typeof Throttle>[0] = {
  auth: {
    limit: AUTH_RATE_LIMIT_LIMIT,
    ttl: AUTH_RATE_LIMIT_TTL,
  },
};

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    userId: string;
    username: string;
  };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  private readonly csrfHeaderName: string;

  constructor(
    private readonly authService: AuthService,
    private readonly authCookieService: AuthCookieService,
    private readonly configService: ConfigService,
  ) {
    const authCfg = loadAuthConfig(this.configService);
    this.csrfHeaderName = normalizeHeaderName(
      authCfg.csrf?.headerName,
      'x-csrf-token',
    );
    this.logger.log('AuthController initialized');
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle(AUTH_THROTTLE_OPTIONS)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthSessionResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Username already exists' })
  @LogMethod('info')
  async register(
    @Body() registerDto: RegisterDto,
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSessionResponseDto> {
    this.logger.log(
      `Register: ${registerDto.firstName} ${registerDto.lastName}`,
    );
    const session = await this.authService.register(
      registerDto,
      this.buildMetadata(req),
    );
    this.logger.log(
      `Register success: ${registerDto.firstName} ${registerDto.lastName}`,
    );
    this.setCookies(res, session);
    return this.toSessionResponse(session);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle(AUTH_THROTTLE_OPTIONS)
  @ApiOperation({ summary: 'Login with username and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthSessionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @LogMethod('info')
  async login(
    @Body() loginDto: LoginDto,
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSessionResponseDto> {
    this.logger.log(`Login: ${loginDto.username}`);
    const session = await this.authService.login(
      loginDto,
      this.buildMetadata(req),
    );
    this.logger.log(`Login success: ${loginDto.username}`);
    this.setCookies(res, session);
    return this.toSessionResponse(session);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthCsrfGuard)
  @Throttle(AUTH_THROTTLE_OPTIONS)
  @ApiOperation({ summary: 'Refresh tokens using HTTP-only cookies' })
  @ApiResponse({
    status: 200,
    description: 'Session refreshed successfully',
    type: AuthSessionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSessionResponseDto> {
    const refreshToken = this.authCookieService.getRefreshTokenFromRequest(req);
    const csrfToken = this.extractCsrfHeader(req);

    const session = await this.authService.refreshSession(
      refreshToken,
      csrfToken,
      this.buildMetadata(req),
    );

    this.setCookies(res, session);
    return this.toSessionResponse(session);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, AuthCsrfGuard)
  @Throttle(AUTH_THROTTLE_OPTIONS)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout by revoking the current refresh token' })
  @ApiResponse({ status: 204, description: 'Logout successful' })
  async logout(
    @Request() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const refreshToken = this.authCookieService.getRefreshTokenFromRequest(req);
    const csrfToken = this.extractCsrfHeader(req);
    await this.authService.logout(refreshToken, csrfToken, req.user.userId);
    this.authCookieService.clearAuthCookies(res);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Current user returned',
    type: CurrentUserResponseDto,
  })
  @LogMethod('info')
  async me(
    @Request() req: AuthenticatedRequest,
  ): Promise<CurrentUserResponseDto> {
    const user = await this.authService.validateUser(req.user.userId);
    return plainToInstance(CurrentUserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  private setCookies(res: Response, session: AuthSession): void {
    this.authCookieService.setAuthCookies(res, {
      accessToken: {
        value: session.accessToken.value,
      },
      refreshToken: {
        id: session.refreshToken.id,
        value: session.refreshToken.value,
      },
      csrfToken: session.csrfToken,
    });
  }

  private toSessionResponse(session: AuthSession): AuthSessionResponseDto {
    return plainToInstance(
      AuthSessionResponseDto,
      {
        user: session.user,
        csrfToken: session.csrfToken,
        accessTokenExpiresAt: session.accessToken.expiresAt,
        refreshTokenExpiresAt: session.refreshToken.expiresAt,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  private buildMetadata(req: ExpressRequest): SessionMetadata {
    return {
      userAgent: req.headers['user-agent'] ?? null,
      ipAddress: req.ip ?? req.socket?.remoteAddress ?? null,
    };
  }

  private extractCsrfHeader(req: ExpressRequest): string | undefined {
    const value = req.headers[this.csrfHeaderName];
    if (!value) {
      return undefined;
    }
    return Array.isArray(value) ? value[0] : value;
  }
}
