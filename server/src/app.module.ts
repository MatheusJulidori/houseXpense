import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import {
  ThrottlerGuard,
  ThrottlerModule,
  type ThrottlerModuleOptions,
} from '@nestjs/throttler';
import { DatabaseModule } from './infrastructure/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { TagModule } from './modules/tag/tag.module';
import { MovementModule } from './modules/movement/movement.module';
import { HealthModule } from './modules/health/health.module';
import { createWinstonConfig } from './config/winston.config';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import databaseConfig from './config/database.config';
import { validateEnvironment } from './config/env.validation';

const parseRateLimitNumber = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, databaseConfig],
      validate: validateEnvironment,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): ThrottlerModuleOptions => {
        const authCfg =
          configService.get<ConfigType<typeof authConfig>>('auth');
        return {
          throttlers: [
            {
              ttl: parseRateLimitNumber(
                typeof authCfg?.rateLimit === 'object' &&
                  authCfg.rateLimit !== null
                  ? (authCfg.rateLimit as Record<string, unknown>).ttl
                  : undefined,
                60,
              ),
              limit: parseRateLimitNumber(
                typeof authCfg?.rateLimit === 'object' &&
                  authCfg.rateLimit !== null
                  ? (authCfg.rateLimit as Record<string, unknown>).limit
                  : undefined,
                100,
              ),
            },
          ],
        };
      },
    }),
    createWinstonConfig(),
    DatabaseModule,
    AuthModule,
    TagModule,
    MovementModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
