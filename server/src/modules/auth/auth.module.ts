import { Module } from '@nestjs/common';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { User } from '../../entities/user.entity';
import authConfig from '../../config/auth.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
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
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
