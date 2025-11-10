import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { User } from '../entities/user.entity';
import { Tag } from '../entities/tag.entity';
import { Movement } from '../entities/movement.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL') || '';
        const dbKeyPath = configService.get<string>('DB_KEY_PATH');
        const nodeEnv = configService.get<string>('NODE_ENV');

        // Parse DATABASE_URL
        const url = new URL(databaseUrl);
        const host = url.hostname;
        const port = parseInt(url.port) || 5432;
        const username = url.username;
        const password = url.password;
        const database = url.pathname.slice(1);

        // SSL configuration
        let ssl: boolean | { ca?: string; rejectUnauthorized: boolean } = false;

        if (dbKeyPath) {
          let certPath = dbKeyPath;

          // If path doesn't start with /, it's relative to project root
          if (!dbKeyPath.startsWith('/')) {
            certPath = path.resolve(process.cwd(), dbKeyPath);
          }

          if (fs.existsSync(certPath)) {
            try {
              const ca = fs.readFileSync(certPath, 'utf8');
              ssl = {
                ca,
                rejectUnauthorized: true,
              };
              console.log(`✅ SSL certificate loaded from: ${certPath}`);
            } catch {
              console.warn(
                '⚠️  Failed to read SSL certificate, using rejectUnauthorized: false',
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
        } else if (databaseUrl.includes('sslmode=require')) {
          ssl = {
            rejectUnauthorized: false,
          };
        }

        return {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
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
