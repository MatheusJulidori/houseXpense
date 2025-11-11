import { registerAs } from '@nestjs/config';

const normalizeDatabaseUrl = (): string | undefined => {
  if (process.env.DATABASE_URL?.trim()) {
    return process.env.DATABASE_URL;
  }

  const host = process.env.DATABASE_HOST;
  const port = process.env.DATABASE_PORT ?? '5432';
  const user = process.env.DATABASE_USER;
  const password = process.env.DATABASE_PASSWORD;
  const name = process.env.DATABASE_NAME;

  if (host && user && password && name) {
    return `postgres://${encodeURIComponent(
      user,
    )}:${encodeURIComponent(password)}@${host}:${port}/${name}`;
  }

  return undefined;
};

export default registerAs('database', () => ({
  url: normalizeDatabaseUrl(),
  sslMode: process.env.DATABASE_SSL_MODE ?? 'disable',
  sslKeyPath: process.env.DB_KEY_PATH,
}));
