/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import appConfig from './app.config';

export const createWinstonConfig = () => {
  return WinstonModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      const app = configService.get<ConfigType<typeof appConfig>>('app') ?? {
        nodeEnv: 'development',
        port: 3000,
        logLevel: 'info',
        corsOrigins: [],
      };

      return {
        level: (app as { logLevel?: string }).logLevel ?? 'info',
        format: winston.format.combine(
          winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
          }),
          winston.format.errors({ stack: true }),
        ),
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize({ all: true }),
              winston.format.printf(
                ({ timestamp, level, message, context }) => {
                  const contextStr = context
                    ? `[${JSON.stringify(context as Record<string, unknown>)}]`
                    : '';
                  return `${timestamp} ${level} ${contextStr} ${String(message)}`;
                },
              ),
            ),
          }),
        ],
      };
    },
  });
};
