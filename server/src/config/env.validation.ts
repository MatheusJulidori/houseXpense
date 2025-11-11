/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { plainToInstance, Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  SERVER_PORT?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  PORT?: number;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsOptional()
  @IsString()
  JWT_EXPIRE?: string;

  @IsOptional()
  @IsString()
  AUTH_ACCESS_TOKEN_SECRET?: string;

  @IsOptional()
  @IsString()
  AUTH_REFRESH_TOKEN_SECRET?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  AUTH_ACCESS_TOKEN_TTL?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  AUTH_REFRESH_TOKEN_TTL?: number;

  @IsOptional()
  @IsString()
  AUTH_ACCESS_COOKIE_NAME?: string;

  @IsOptional()
  @IsString()
  AUTH_REFRESH_COOKIE_NAME?: string;

  @IsOptional()
  @IsString()
  AUTH_CSRF_COOKIE_NAME?: string;

  @IsOptional()
  @IsString()
  AUTH_COOKIE_DOMAIN?: string;

  @IsOptional()
  @IsString()
  AUTH_COOKIE_PATH?: string;

  @IsOptional()
  @IsString()
  AUTH_COOKIE_SAME_SITE?: string;

  @IsOptional()
  @IsString()
  AUTH_COOKIE_SECURE?: string;

  @IsOptional()
  @IsString()
  AUTH_CSRF_HEADER_NAME?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  AUTH_RATE_LIMIT_TTL?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  AUTH_RATE_LIMIT_LIMIT?: number;

  @IsOptional()
  @IsString()
  DATABASE_URL?: string;

  @ValidateIf((env) => !env.DATABASE_URL)
  @IsString()
  @IsNotEmpty()
  DATABASE_HOST?: string;

  @ValidateIf((env) => !env.DATABASE_URL)
  @IsNumber()
  @Type(() => Number)
  DATABASE_PORT?: number;

  @ValidateIf((env) => !env.DATABASE_URL)
  @IsString()
  @IsNotEmpty()
  DATABASE_USER?: string;

  @ValidateIf((env) => !env.DATABASE_URL)
  @IsString()
  @IsNotEmpty()
  DATABASE_PASSWORD?: string;

  @ValidateIf((env) => !env.DATABASE_URL)
  @IsString()
  @IsNotEmpty()
  DATABASE_NAME?: string;

  @IsOptional()
  @IsString()
  DATABASE_SSL_MODE?: string;

  @IsOptional()
  @IsString()
  DB_KEY_PATH?: string;

  @IsOptional()
  @IsString()
  BACKEND_LOG_LEVEL?: string;

  @IsOptional()
  @IsString()
  CORS_ORIGIN?: string;
}

export const validateEnvironment = (
  config: Record<string, unknown>,
): Record<string, unknown> => {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
    exposeDefaultValues: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const messages = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('; ');
    throw new Error(`Environment validation failed: ${messages}`);
  }

  return validatedConfig as unknown as Record<string, unknown>;
};
