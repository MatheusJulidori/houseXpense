import { LogLevel } from '@nestjs/common';

export const LOG_LEVELS: LogLevel[] = [
  'error',
  'warn',
  'log',
  'debug',
  'verbose',
  'fatal',
];

export const getLogLevel = (): LogLevel => {
  const env = process.env.NODE_ENV || 'development';
  const logLevel = process.env.LOG_LEVEL as LogLevel;

  if (logLevel && LOG_LEVELS.includes(logLevel)) {
    return logLevel;
  }

  return env === 'production' ? 'warn' : 'debug';
};

export const LOG_CONFIG = {
  level: getLogLevel(),
  enableConsole:
    process.env.NODE_ENV !== 'production' ||
    process.env.ENABLE_CONSOLE_LOGS === 'true',
  enableFile: process.env.NODE_ENV === 'production',
  maxFileSize: '5MB',
  maxFiles: 5,
  logDirectory: 'logs',
};
