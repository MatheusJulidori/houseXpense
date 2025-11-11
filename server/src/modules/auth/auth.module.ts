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

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity]),
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
          expiresIn: (jwt.expiresIn ?? '24h') as NonNullable<
            NonNullable<JwtModuleOptions['signOptions']>['expiresIn']
          >,
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
    {
      provide: UserRepositoryToken,
      useClass: UserTypeormRepository,
    },
  ],
  exports: [AuthService, JwtStrategy, UserRepositoryToken],
})
export class AuthModule {}
