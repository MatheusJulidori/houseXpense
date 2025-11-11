import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes, randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { UserOrmEntity } from '../infrastructure/entities/user.orm-entity';
import { RegisterDto } from '../presentation/dto/register.dto';
import { LoginDto } from '../presentation/dto/login.dto';
import {
  RefreshTokenRepository,
  RefreshTokenRepositoryToken,
} from '../domain/ports/refresh-token.repository';
import { CreateRefreshTokenProps } from '../domain/entities/refresh-token';
import { LogMethod } from '../../../decorators/log.decorator';
import {
  AuthModuleConfig,
  loadAuthConfig,
  toPositiveNumber,
} from './auth-config.util';

export interface SessionMetadata {
  userAgent?: string | null;
  ipAddress?: string | null;
}

export interface AuthSession {
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  accessToken: {
    value: string;
    expiresAt: Date;
  };
  refreshToken: {
    id: string;
    value: string;
    expiresAt: Date;
  };
  csrfToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly authConfig: AuthModuleConfig;
  private readonly accessTokenTtlSeconds: number;
  private readonly refreshTokenTtlSeconds: number;
  private readonly bcryptRounds = 12;

  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
    private readonly jwtService: JwtService,
    @Inject(RefreshTokenRepositoryToken)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly configService: ConfigService,
  ) {
    this.authConfig = loadAuthConfig(this.configService);
    this.accessTokenTtlSeconds = toPositiveNumber(
      this.authConfig.jwt?.expiresIn,
      60 * 60 * 24,
    );
    this.refreshTokenTtlSeconds = toPositiveNumber(
      this.authConfig.refreshToken?.ttl,
      60 * 60 * 24 * 7,
    );

    this.logger.log('AuthService initialized with secure cookie strategy');
  }

  @LogMethod('info')
  async register(
    registerDto: RegisterDto,
    metadata: SessionMetadata = {},
  ): Promise<AuthSession> {
    const { firstName, lastName, password } = registerDto;

    this.logger.debug(
      `Starting user registration for: ${firstName} ${lastName}`,
    );

    const username = `${firstName}${lastName}`
      .toLowerCase()
      .replace(/\s+/g, '');

    const existingUser = await this.userRepository.findOne({
      where: { username },
    });

    if (existingUser) {
      this.logger.warn(
        `Registration failed: Username ${username} already exists`,
      );
      throw new ConflictException('User with this username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, this.bcryptRounds);

    const user = this.userRepository.create({
      firstName,
      lastName,
      username,
      password: hashedPassword,
    });

    await this.userRepository.save(user);
    this.logger.log(`User created successfully with ID: ${user.id}`);

    return this.createSession(user, metadata);
  }

  @LogMethod('info')
  async login(
    loginDto: LoginDto,
    metadata: SessionMetadata = {},
  ): Promise<AuthSession> {
    const { username, password } = loginDto;

    this.logger.debug(`Login attempt for username: ${username}`);

    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      this.logger.warn(`Login failed: User ${username} not found`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`Login failed: Invalid password for user ${username}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`Login successful for user: ${username} (ID: ${user.id})`);
    return this.createSession(user, metadata);
  }

  @LogMethod('info')
  async refreshSession(
    refreshTokenRaw: string | undefined,
    csrfToken: string | undefined,
    metadata: SessionMetadata = {},
  ): Promise<AuthSession> {
    const parsedToken = this.parseRefreshToken(refreshTokenRaw);
    if (!parsedToken || !csrfToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const current = await this.refreshTokenRepository.findById(parsedToken.id);
    if (!current) {
      throw new UnauthorizedException('Refresh token not found');
    }

    if (current.revokedAt) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    if (this.isExpired(current.expiresAt)) {
      await this.refreshTokenRepository.markRevoked(current.id, new Date());
      throw new UnauthorizedException('Refresh token expired');
    }

    const matchesRefresh = await bcrypt.compare(
      parsedToken.value,
      current.hashedToken,
    );

    if (!matchesRefresh) {
      this.logger.warn('Refresh token hash mismatch detected');
      await this.refreshTokenRepository.markRevoked(current.id, new Date());
      throw new UnauthorizedException('Invalid refresh token');
    }

    const matchesCsrf = await bcrypt.compare(
      csrfToken,
      current.hashedCsrfToken,
    );

    if (!matchesCsrf) {
      this.logger.warn('CSRF token mismatch during refresh');
      await this.refreshTokenRepository.markRevoked(current.id, new Date());
      throw new UnauthorizedException('Invalid CSRF token');
    }

    const user = await this.userRepository.findOne({
      where: { id: current.userId },
    });

    if (!user) {
      await this.refreshTokenRepository.markRevoked(current.id, new Date());
      throw new UnauthorizedException('User not found');
    }

    const nextSession = await this.buildRefreshTokenData(user.id, metadata);

    await this.refreshTokenRepository.replace(current.id, nextSession.record);

    const accessToken = this.generateAccessToken(user);

    return {
      user: this.toUserPayload(user),
      accessToken,
      refreshToken: nextSession.plain.refreshToken,
      csrfToken: nextSession.plain.csrfToken,
    };
  }

  @LogMethod('info')
  async logout(
    refreshTokenRaw: string | undefined,
    csrfToken: string | undefined,
    userId: string,
  ): Promise<void> {
    const parsed = this.parseRefreshToken(refreshTokenRaw);
    const now = new Date();

    if (parsed && csrfToken) {
      const token = await this.refreshTokenRepository.findById(parsed.id);
      if (token && token.userId === userId) {
        const matchesRefresh = await bcrypt.compare(
          parsed.value,
          token.hashedToken,
        );
        const matchesCsrf = await bcrypt.compare(
          csrfToken,
          token.hashedCsrfToken,
        );
        if (matchesRefresh && matchesCsrf) {
          await this.refreshTokenRepository.markRevoked(token.id, now);
        }
      }
    }

    await this.refreshTokenRepository.revokeAllForUser(userId);
  }

  @LogMethod('debug')
  async validateUser(userId: string): Promise<UserOrmEntity> {
    this.logger.debug(`Validating user with ID: ${userId}`);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      this.logger.warn(`User validation failed: User ${userId} not found`);
      throw new UnauthorizedException('User not found');
    }

    this.logger.debug(
      `User validation successful: ${user.username} (ID: ${user.id})`,
    );
    return user;
  }

  private async createSession(
    user: UserOrmEntity,
    metadata: SessionMetadata,
  ): Promise<AuthSession> {
    const accessToken = this.generateAccessToken(user);
    const refreshTokenData = await this.buildRefreshTokenData(
      user.id,
      metadata,
    );

    await this.refreshTokenRepository.create(refreshTokenData.record);

    return {
      user: this.toUserPayload(user),
      accessToken,
      refreshToken: refreshTokenData.plain.refreshToken,
      csrfToken: refreshTokenData.plain.csrfToken,
    };
  }

  private async buildRefreshTokenData(
    userId: string,
    metadata: SessionMetadata,
  ): Promise<{
    record: CreateRefreshTokenProps;
    plain: {
      refreshToken: { id: string; value: string; expiresAt: Date };
      csrfToken: string;
    };
  }> {
    const refreshTokenId = randomUUID();
    const refreshTokenValue = randomBytes(64).toString('hex');
    const csrfToken = randomBytes(32).toString('hex');

    const hashedRefreshToken = await bcrypt.hash(
      refreshTokenValue,
      this.bcryptRounds,
    );
    const hashedCsrfToken = await bcrypt.hash(csrfToken, this.bcryptRounds);

    const expiresAt = new Date(Date.now() + this.refreshTokenTtlSeconds * 1000);

    const record: CreateRefreshTokenProps = {
      id: refreshTokenId,
      userId,
      hashedToken: hashedRefreshToken,
      hashedCsrfToken,
      expiresAt,
      userAgent: metadata.userAgent ?? null,
      ipAddress: metadata.ipAddress ?? null,
    };

    return {
      record,
      plain: {
        refreshToken: {
          id: refreshTokenId,
          value: refreshTokenValue,
          expiresAt,
        },
        csrfToken,
      },
    };
  }

  private generateAccessToken(user: UserOrmEntity): {
    value: string;
    expiresAt: Date;
  } {
    const payload = { sub: user.id, username: user.username };
    const token = this.jwtService.sign(payload);
    const expiresAt = new Date(Date.now() + this.accessTokenTtlSeconds * 1000);
    return { value: token, expiresAt };
  }

  private toUserPayload(user: UserOrmEntity): AuthSession['user'] {
    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  private parseRefreshToken(
    raw: string | undefined,
  ): { id: string; value: string } | null {
    if (!raw) {
      return null;
    }
    const [id, value] = raw.split('.');
    if (!id || !value) {
      return null;
    }
    return { id, value };
  }

  private isExpired(date: Date): boolean {
    return date.getTime() <= Date.now();
  }
}
