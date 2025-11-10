import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const createWinstonConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

  return WinstonModule.forRoot({
    level: logLevel,
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.errors({ stack: true }),
    ),
    transports: [
      // Console transport only (Render will capture this)
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          winston.format.printf(({ timestamp, level, message, context }) => {
            const contextStr = context ? `[${context}]` : '';
            return `${timestamp} ${level} ${contextStr} ${message}`;
          }),
        ),
      }),
    ],
  });
};
