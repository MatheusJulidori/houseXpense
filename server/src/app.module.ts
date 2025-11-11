import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { TagModule } from './modules/tag/tag.module';
import { MovementModule } from './modules/movement/movement.module';
import { HealthModule } from './health/health.module';
import { SimpleHealthController } from './health/simple-health.controller';
import { createWinstonConfig } from './config/winston.config';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import databaseConfig from './config/database.config';
import { validateEnvironment } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, databaseConfig],
      validate: validateEnvironment,
    }),
    createWinstonConfig(),
    DatabaseModule,
    AuthModule,
    TagModule,
    MovementModule,
    HealthModule,
  ],
  controllers: [SimpleHealthController],
  providers: [],
})
export class AppModule {}
