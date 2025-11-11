import { Module } from '@nestjs/common';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './application/auth.service';
import { AuthController } from './presentation/auth.controller';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { UserTypeormRepository } from './infrastructure/repositories/user-typeorm.repository';
import { UserRepositoryToken } from './domain/ports/user.repository';
import { UserOrmEntity } from './infrastructure/entities/user.orm-entity';
import authConfig from '../../config/auth.config';
import { RefreshTokenOrmEntity } from './infrastructure/entities/refresh-token.orm-entity';
import { RefreshTokenRepositoryToken } from './domain/ports/refresh-token.repository';
import { RefreshTokenTypeormRepository } from './infrastructure/repositories/refresh-token-typeorm.repository';
import { AuthCookieService } from './application/auth-cookie.service';
import { AuthCsrfGuard } from './presentation/guards/auth-csrf.guard';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([UserOrmEntity, RefreshTokenOrmEntity]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const authConfigValues =
          configService.get<ConfigType<typeof authConfig>>('auth');

        const jwt = authConfigValues?.jwt;

        if (!jwt?.secret) {
          throw new Error('JWT secret is not configured.');
        }

        const signOptions: NonNullable<JwtModuleOptions['signOptions']> = {
          expiresIn: jwt.expiresIn ?? 60 * 60 * 24,
        };

        const options: JwtModuleOptions = {
          secret: jwt.secret,
          signOptions,
        };

        return options;
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    AuthCookieService,
    AuthCsrfGuard,
    {
      provide: UserRepositoryToken,
      useClass: UserTypeormRepository,
    },
    {
      provide: RefreshTokenRepositoryToken,
      useClass: RefreshTokenTypeormRepository,
    },
  ],
  exports: [
    AuthService,
    JwtStrategy,
    UserRepositoryToken,
    RefreshTokenRepositoryToken,
  ],
})
export class AuthModule {}
