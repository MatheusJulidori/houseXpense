import { registerAs } from '@nestjs/config';

const parseOrigins = (rawOrigins?: string): string[] => {
  if (!rawOrigins) {
    return ['http://localhost:5173', 'http://localhost:3000'];
  }

  return rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
};

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.SERVER_PORT ?? process.env.PORT ?? 3000) || 3000,
  logLevel: process.env.BACKEND_LOG_LEVEL ?? 'info',
  corsOrigins: parseOrigins(process.env.CORS_ORIGIN),
}));
