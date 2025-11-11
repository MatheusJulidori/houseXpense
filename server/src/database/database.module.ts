import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { User } from '../entities/user.entity';
import { Tag } from '../entities/tag.entity';
import { Movement } from '../entities/movement.entity';
import databaseConfig from '../config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig =
          configService.get<ConfigType<typeof databaseConfig>>('database');

        const databaseUrl = dbConfig?.url;
        if (!databaseUrl) {
          throw new Error(
            'DATABASE_URL or equivalent database configuration is required.',
          );
        }

        const { hostname, port, username, password, pathname } = new URL(
          databaseUrl,
        );

        const databaseName = pathname.replace(/^\//, '');

        let ssl: boolean | { ca?: string; rejectUnauthorized: boolean } = false;

        const sslMode = dbConfig?.sslMode?.toLowerCase();
        const keyPath = dbConfig?.sslKeyPath;

        if (sslMode === 'require' || sslMode === 'verify-full') {
          ssl = {
            rejectUnauthorized: sslMode === 'verify-full',
          };
        }

        if (keyPath) {
          let certPath = keyPath;

          if (!keyPath.startsWith('/')) {
            certPath = path.resolve(process.cwd(), keyPath);
          }

          if (fs.existsSync(certPath)) {
            try {
              const ca = fs.readFileSync(certPath, 'utf8');
              ssl = {
                ca,
                rejectUnauthorized: sslMode !== 'allow',
              };
              console.log(`✅ SSL certificate loaded from: ${certPath}`);
            } catch {
              console.warn(
                '⚠️  Failed to read SSL certificate, falling back to rejectUnauthorized: false',
              );
              ssl = {
                rejectUnauthorized: false,
              };
            }
          } else {
            console.warn(`⚠️  SSL certificate not found at: ${certPath}`);
            ssl = {
              rejectUnauthorized: false,
            };
          }
        }

        const nodeEnv = configService.get<string>('NODE_ENV') ?? 'development';

        return {
          type: 'postgres',
          host: hostname,
          port: Number(port) || 5432,
          username,
          password,
          database: databaseName,
          ssl,
          entities: [User, Tag, Movement],
          synchronize: nodeEnv !== 'production',
          logging: nodeEnv === 'development',
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
