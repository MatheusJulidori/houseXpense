import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './presentation/controllers/health.controller';
import { SimpleHealthController } from './presentation/controllers/simple-health.controller';
import { HealthService } from './application/health.service';

@Module({
  imports: [TypeOrmModule],
  controllers: [HealthController, SimpleHealthController],
  providers: [HealthService],
})
export class HealthModule {}
