import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface HealthCheckResult {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  checks: {
    database: {
      status: 'ok' | 'error';
      responseTime?: number;
      error?: string;
    };
  };
}

@Injectable()
export class HealthService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async check(): Promise<HealthCheckResult> {
    const timestamp = new Date().toISOString();
    const uptime = process.uptime();

    // Check database connection
    const dbCheck = await this.checkDatabase();

    const isHealthy = dbCheck.status === 'ok';

    return {
      status: isHealthy ? 'ok' : 'error',
      timestamp,
      uptime,
      checks: {
        database: dbCheck,
      },
    };
  }

  async ready(): Promise<{ status: string; message: string }> {
    const dbCheck = await this.checkDatabase();

    if (dbCheck.status === 'error') {
      return {
        status: 'not ready',
        message: 'Database connection failed',
      };
    }

    return {
      status: 'ready',
      message: 'Service is ready to accept traffic',
    };
  }

  live(): { status: string; message: string } {
    return {
      status: 'alive',
      message: 'Service is running',
    };
  }

  private async checkDatabase(): Promise<{
    status: 'ok' | 'error';
    responseTime?: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      // Simple query to test database connection
      await this.dataSource.query('SELECT 1');
      const responseTime = Date.now() - startTime;

      return {
        status: 'ok',
        responseTime,
      };
    } catch (error) {
      return {
        status: 'error',
        error:
          error instanceof Error ? error.message : 'Unknown database error',
      };
    }
  }
}
