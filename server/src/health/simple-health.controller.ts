import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller()
export class SimpleHealthController {
  private readonly logger = new Logger(SimpleHealthController.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    this.logger.log('SimpleHealthController initialized');
  }

  @Get()
  root() {
    return { message: 'HouseXpense API is running!', status: 'ok' };
  }

  @Get('healthz')
  async health() {
    try {
      // Test database connection
      await this.dataSource.query('SELECT 1');
      return { status: 'ok', message: 'Service is healthy' };
    } catch (error) {
      this.logger.error('Health check failed - DB error');
      throw new HttpException(
        {
          status: 'error',
          message: 'DB conn error',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
