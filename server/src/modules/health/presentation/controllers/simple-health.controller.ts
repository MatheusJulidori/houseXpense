import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HealthService } from '../../application/health.service';

@Controller()
export class SimpleHealthController {
  private readonly logger = new Logger(SimpleHealthController.name);

  constructor(private readonly healthService: HealthService) {
    this.logger.log('SimpleHealthController initialized');
  }

  @Get()
  root() {
    return { message: 'HouseXpense API is running!', status: 'ok' };
  }

  @Get('healthz')
  async health() {
    try {
      const healthStatus = await this.healthService.check();
      if (healthStatus.status !== 'ok') {
        throw new Error(healthStatus.checks.database.error ?? 'unknown');
      }

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
